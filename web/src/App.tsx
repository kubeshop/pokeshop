import { ThemeProvider } from 'styled-components';
import { QueryClient, QueryClientProvider } from 'react-query';
import './utils/tracer';
import Router from './components/Router';
import { theme } from './constants/theme';

import 'antd/dist/antd.css';
import 'App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <Router />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
