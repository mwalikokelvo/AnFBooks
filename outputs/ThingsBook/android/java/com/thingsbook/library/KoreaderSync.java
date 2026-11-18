package com.thingsbook.library;

import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import org.json.JSONObject;

/** KOReader progress sync requests for the library page: only to the https server the owner entered,
 *  no cookies, no redirects; sends the account name, KOReader's MD5 key and one book's position. */
final class KoreaderSync {
 private static final int LIMIT=64*1024,TIMEOUT=15000;
 static String server(String value){try{
  String text=value==null?"":value.trim();URI u=new URI(text);
  if(!"https".equals(u.getScheme())||u.getHost()==null||u.getUserInfo()!=null||u.getRawQuery()!=null||u.getRawFragment()!=null||text.length()>500)return null;
  return text.replaceAll("/+$","");
 }catch(Exception e){return null;}}
 private static boolean text(String value,int max){return value!=null&&!value.isEmpty()&&value.length()<=max&&!value.matches("(?s).*[\\u0000-\\u001f].*");}
 private static final String HEX32="[a-f0-9]{32}";
 /** Returns {"value":…} or {"error":plain message} as JSON text. */
 static String request(JSONObject value){
  try{return new JSONObject().put("value",call(value)).toString();}
  catch(IOException e){return error(e.getMessage());}
  catch(Exception e){return error("Could not reach the sync server.");}
 }
 private static String error(String message){try{return new JSONObject().put("error",message).toString();}catch(Exception e){return "{}";}}
 private static JSONObject call(JSONObject value) throws Exception{
  String base=server(value.optString("server")),user=value.optString("user"),key=value.optString("key"),action=value.optString("action"),document=value.optString("document");
  if(base==null)throw new IOException("Enter the server's https address.");
  if(!text(user,100)||!key.matches(HEX32))throw new IOException("Enter the username and password of your sync account.");
  String path,method="GET";byte[] body=null;
  if("auth".equals(action))path="/users/auth";
  else{
   if(!document.matches(HEX32))throw new IOException("Invalid book ID.");
   if("get".equals(action))path="/syncs/progress/"+document;
   else if("put".equals(action)){
    double percentage=value.optDouble("percentage",-1);String progress=value.optString("progress"),device=value.optString("device"),deviceId=value.optString("device_id");
    if(!text(progress,200)||!(percentage>=0&&percentage<=1)||!text(device,100)||!deviceId.matches("[A-Za-z0-9-]{1,64}"))throw new IOException("Invalid reading position.");
    path="/syncs/progress";method="PUT";
    body=new JSONObject().put("document",document).put("progress",progress).put("percentage",percentage).put("device",device).put("device_id",deviceId).toString().getBytes(StandardCharsets.UTF_8);
   }else throw new IOException("Invalid sync request.");
  }
  HttpURLConnection c=(HttpURLConnection)new URL(base+path).openConnection();
  try{
   c.setInstanceFollowRedirects(false);c.setConnectTimeout(TIMEOUT);c.setReadTimeout(TIMEOUT);c.setUseCaches(false);c.setRequestMethod(method);
   c.setRequestProperty("Accept","application/vnd.koreader.v1+json");c.setRequestProperty("x-auth-user",user);c.setRequestProperty("x-auth-key",key);
   if(body!=null){c.setDoOutput(true);c.setRequestProperty("Content-Type","application/json");c.setFixedLengthStreamingMode(body.length);try(OutputStream out=c.getOutputStream()){out.write(body);}}
   int status;try{status=c.getResponseCode();}catch(IOException e){throw new IOException("Could not reach the sync server.");}
   if(status==401||status==403)throw new IOException("The sync server did not accept this username and password.");
   if(status<200||status>299)throw new IOException("The sync server could not save or read this position.");
   if(c.getContentLengthLong()>LIMIT)throw new IOException("The sync server sent too much data.");
   ByteArrayOutputStream out=new ByteArrayOutputStream();
   try(InputStream in=c.getInputStream()){byte[] buffer=new byte[8192];int read;while((read=in.read(buffer))!=-1){if(out.size()+read>LIMIT)throw new IOException("The sync server sent too much data.");out.write(buffer,0,read);}}
   String reply=out.toString("UTF-8").trim();
   try{return reply.isEmpty()?new JSONObject():new JSONObject(reply);}catch(Exception e){throw new IOException("The sync server sent something that is not KOReader sync data.");}
  }finally{c.disconnect();}
 }
}
