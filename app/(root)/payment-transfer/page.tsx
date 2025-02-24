/* eslint-disable @typescript-eslint/no-unused-vars */
import HeaderBox from '@/components/HeaderBox'
import PaymentTransferForm from '@/components/PaymentTransferForm'
import { getAccounts } from '@/lib/actions/bank.actions';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import React from 'react'

const PaymentTransfer = async () => {

  
  const isLoggedIn = await getLoggedInUser();

  const accounts = await getAccounts({ userId: isLoggedIn.$id });


  if(!accounts) return;

  const accountsData = accounts?.data;

  return (
    <section className='payment-transfer'>
      <HeaderBox 
          title='Payment Transfer'
          subtext='Transfer money to your friends and family'
       />
       <section className='size-full pt-5'>
        <PaymentTransferForm
          accounts={accountsData}
        />
       </section>

    </section>
  )
}

export default PaymentTransfer