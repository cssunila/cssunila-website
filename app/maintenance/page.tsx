import Maintenance from '@/components/site/Maintenance';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Maintenance",
  description: "Website CSS 3.0 sedang dalam perbaikan"
}

const MaintenancePage = () => {
  return <Maintenance />;
}

export default MaintenancePage;
