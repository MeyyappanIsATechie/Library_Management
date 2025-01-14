import BookList from '@/components/BookList';
import BookOverview from '@/components/BookOverview';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <>
      <BookOverview />
      <BookList />
    </>
  );
}
