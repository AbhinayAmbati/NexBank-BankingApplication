import HeaderBox from '@/components/HeaderBox'
import RightSidebar from '@/components/RightSidebar'
import TotalBalanceBox from '@/components/TotalBalanceBox'

const Home = () => {

  const isLoggedIn = {
    firstName: "Abhinay",
    lastName: "Ambati",
    email: "abhinayambati4@gmail.com",
  };
  
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
          accounts = {[]}
          totalBanks = {1}
          totalCurrentBalance={1250.35}
          />
        </header>
        RECENT TRANSACTIONS
      </div>
      <RightSidebar
      user={isLoggedIn}
      transactions={[]}
      banks={[{currentBalance: 123.50},{currentBalance: 250.50}]}
      />
    </section>
  )
}

export default Home
