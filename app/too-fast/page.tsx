import React from 'react';

const Page = () => {
  return (
    <main className="root-container flex min-h-screen flex-col items-center justify-center">
      <h1 className="font-bebas-neue text-5xl font-bold text-light-100">
        oooohhh!!! take it slow...
      </h1>
      <p className="mt-3 max-w-xl text-center text-light-400">
        Too many requests! We’re temporarily limiting access to protect our
        service. Please try again later.
      </p>
    </main>
  );
};

export default Page;
