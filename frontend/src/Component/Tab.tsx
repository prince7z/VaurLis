import * as React from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';


export default function LabTabs() {
  const [value, setValue] = React.useState('1');

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%', typography: 'body1' }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example ">
            <Tab label="Sent" value="1" />
            <Tab label="Recived" value="2" />
          </TabList>
        </Box>
{/*         
       <TransactionCards transactions={[
          { description: 'C', amount: 499, timestamp: '', status: 'Success' },
          { description: 'Course Purchase - Advanced JavaScript', amount: 799, date: '2024-06-12', status: 'Success' },
        ]} />
      </TabContext> */}
      </TabContext>
    </Box>
  );
}

// function TransactionCards({ transactions }) {
//   return (
//     <div className="grid gap-3">
//       {transactions.map((tx, i) => (
//         <div key={i} className="bg-white p-4 rounded-xl shadow-md">
//           <div className="flex justify-between items-center">
//             <h3 className="font-semibold">{tx.description}</h3>
//             <span className={`${tx.status === 'Success' ? 'text-green-500' : 'text-red-500'}`}>
//               {tx.status}
//             </span>
//           </div>
//           <p className="text-sm text-gray-500">{tx.date}</p>
//           <p className="text-lg font-bold mt-1">₹{tx.amount}</p>
//         </div>
//       ))}
//     </div>
//   );
// }
