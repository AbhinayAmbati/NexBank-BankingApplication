/* eslint-disable @typescript-eslint/no-unused-vars */
import HeaderBox from '@/components/HeaderBox'
import RightSidebar from '@/components/RightSidebar'
import TotalBalanceBox from '@/components/TotalBalanceBox'
import { getAccount, getAccounts } from '@/lib/actions/bank.actions';
import { getLoggedInUser } from '@/lib/actions/user.actions';

const Home = async ({ searchParams : {id, page}} : SearchParamProps) => {

  const isLoggedIn = await getLoggedInUser();

  const accounts = await getAccounts({ userId: isLoggedIn.$id });

  if(!accounts) return;

  const accountsData = accounts?.data;

  const appwriteItemId = (id as string) || accountsData[0]?.appwriteItemId;

  const account = await getAccount({ appwriteItemId });
  
  return (
    <section className='home'>
      <div className="home-content">
        <header className='home-header'>
          <HeaderBox
          type="greeting"
          title="Welcome"
          user={isLoggedIn?.firstName || 'Guest'}
          subtext="Access and manage your account and transactions efficiently."
          />
          <TotalBalanceBox
          accounts = {accountsData}
          totalBanks = {accounts?.totalBanks}
          totalCurrentBalance={accounts?.totalCurrentBalance}
          />
        </header>
        RECENT TRANSACTIONS
      </div>
      <RightSidebar
      user={isLoggedIn}
      transactions={accountsData?.transactions}
      banks={accountsData?.slice(0,2)}
      />
    </section>
  )
}

export default Home
