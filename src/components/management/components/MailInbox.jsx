import React from 'react';
import { MailCustomerSection } from './MailCustomerSection';
import { MailRiderSection } from './MailRiderSection';
import { MailVendorsSection } from './MailVendorsSection';

export function MailInbox() {
  return (
    <div className="space-y-8 p-6">
      <h2 className='text-center text-[#00A082] text-4xl font-bold'>Status Mail</h2>
      <div className="space-y-8 p-6 flex flex-wrap justify-center gap-4 lg:w-[60vw] items-stretch w-[70vw] mx-auto">
      <MailCustomerSection />
      <MailRiderSection />
      <MailVendorsSection />
      </div>
    </div>
  );
}