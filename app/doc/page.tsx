import { redirect } from 'next/navigation';

export default function DocPage() {
  // When the user visits the default /doc route, automatically redirect to /doc/introduction
  redirect('/doc/introduction');
}
