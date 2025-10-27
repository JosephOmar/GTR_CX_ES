import React from 'react';
import { ChatCustomerSection } from './ChatCustomerSection';
import { ChatRiderSection } from './ChatRiderSection';
import { CallVendorsSection } from './CallVendorsSection';
import { ConcurrencyTier1 } from './ConcurrencyTier1';
import { AvailabilityTier1 } from './AvailabilityTier1';

export function Concurrency() {
  return (
    <div className='space-y-8 p-6 w-full'>
      <h2 className='text-center text-4xl font-bold'>Concurrency</h2>
      <div className="space-y-8 p-6 flex flex-wrap justify-center gap-4 lg:w-[60vw] items-stretch w-[70vw] mx-auto">
        <ConcurrencyTier1 />
        <CallVendorsSection />
        <AvailabilityTier1 />
      </div>
    </div>
  );
}