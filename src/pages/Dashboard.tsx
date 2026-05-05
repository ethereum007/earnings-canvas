import DashboardNav from "@/components/DashboardNav";
import QuarterTabs from "@/components/QuarterTabs";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <QuarterTabs />
    </div>
  );
};

export default Dashboard;
