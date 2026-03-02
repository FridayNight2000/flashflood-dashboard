import { redirect } from 'next/navigation';

export default function DocumentPage() {
  // 当用户访问默认的 /document 路由时，自动重定向到 /document/intro
  redirect('/document/intro');
}
