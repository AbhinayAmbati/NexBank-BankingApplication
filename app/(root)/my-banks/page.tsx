/* eslint-disable @typescript-eslint/no-unused-vars */
import BankCard from '@/components/BankCard';
import HeaderBox from '@/components/HeaderBox'
import { getAccounts } from '@/lib/actions/bank.actions';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import React from 'react'

const MyBanks = async () => {

  const isLoggedIn = await getLoggedInUser();

  const accounts = await getAccounts({ userId: isLoggedIn.$id });

  return (
    <section className='flex'>
      <div className="my-banks">
        <HeaderBox 
          title='My Banks'
          subtext='Manage your bank accounts'
         />
         <div className="space-y-4">
          <h2 className='header-2'>
            Your Cards
          </h2>
          <div className="flex flex-wrap gap-6">
            {accounts && accounts.data.map((a : Account) => (
              <BankCard
              key={accounts.id}
              account={a}
              userName={isLoggedIn.firstName}
              />
            ))}
            </div>        
         </div>
      </div>
    </section>
  )
}

export default MyBanks