import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

export const tokenPath=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','.local','notion-token.dpapi');
export function loadNotionToken(){
 if(process.env.NOTION_TOKEN)return process.env.NOTION_TOKEN.trim().replace(/[。\s]+$/u,'');
 if(process.platform!=='win32'||!fs.existsSync(tokenPath))throw Error('NOTION_TOKEN 未配置');
 const result=spawnSync('pwsh.exe',['-NoProfile','-NonInteractive','-Command',
  '$s=(Get-Content -LiteralPath $env:LEARNING_TOKEN_FILE -Raw).Trim() | ConvertTo-SecureString; $p=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($s); try {[Console]::Write([Runtime.InteropServices.Marshal]::PtrToStringBSTR($p))} finally {[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($p)}'],
  {encoding:'utf8',env:{...process.env,LEARNING_TOKEN_FILE:tokenPath},windowsHide:true});
 if(result.status!==0)throw Error('无法解密本机 Notion 凭据：'+String(result.stderr||result.error?.code||'').slice(0,1000));
 return result.stdout.trim();
}
export function saveLocalToken(token){
 if(process.platform!=='win32')return;
 fs.mkdirSync(path.dirname(tokenPath),{recursive:true});
 const result=spawnSync('pwsh.exe',['-NoProfile','-NonInteractive','-Command',
  '$s=ConvertTo-SecureString $env:LEARNING_NOTION_TOKEN -AsPlainText -Force; $s | ConvertFrom-SecureString | Set-Content -LiteralPath $env:LEARNING_TOKEN_FILE -Encoding ASCII'],
  {encoding:'utf8',env:{...process.env,LEARNING_NOTION_TOKEN:token,LEARNING_TOKEN_FILE:tokenPath},windowsHide:true});
 if(result.status!==0)throw Error('本机凭据加密保存失败：'+String(result.stderr||result.error?.code||'').replaceAll(token,'[redacted]').slice(0,500));
}
