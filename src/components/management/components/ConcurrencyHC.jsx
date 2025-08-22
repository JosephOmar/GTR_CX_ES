import React from 'react';
import { ChatCustomerSection } from './ChatCustomerSection';
import { ChatRiderSection } from './ChatRiderSection';
import { CallVendorsSection } from './CallVendorsSection';
import { ChatCustomerHCSection } from './ChatCustomerHCSection';

export function ConcurrencyHC() {
  return (
    <div className='space-y-8 p-6 w-full'>
      <h2 className='text-center text-4xl font-bold'>Concurrency HC</h2>
      <div className="space-y-8 p-6 flex flex-wrap justify-center gap-4 lg:w-[60vw] items-stretch w-[70vw] mx-auto">
        <ChatCustomerHCSection />
        <ChatRiderSection />
        <CallVendorsSection />
      </div>
    </div>
  );
}