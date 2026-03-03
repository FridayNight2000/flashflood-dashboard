import { redirect } from 'next/navigation';

export default function DocumentPage() {
  // When the user visits the default /document route, automatically redirect to /document/intro
  redirect('/document/intro');
}
