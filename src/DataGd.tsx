import Box from '@mui/material/Box';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import { TextField } from '@mui/material';
import './style/style.css';
import { useState, useEffect, useMemo } from 'react';
import axiosClient from './services/axiosInstance';
import { NumericFormat } from 'react-number-format';
import { PieChart } from '@mui/x-charts/PieChart';

const FIVE_MIN = 300000;
const MIN_LIMIT = 1;

interface ITokenRepo {
  rank: number;
  symbol: string;
  name: string;
  contract_address: string;
  total_holders: number;
  total_supply: number;
  ptcg_supply: number;
}

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
  }),
}));

export default function DataGd() {
  const client = axiosClient();
  const [tokens, setTokens] = useState<ITokenRepo[]>([]);
  const [name, setTxtName] = useState('');
  const [symbol, setTxtSymbol] = useState('');
  const [contactAddress, setTxtContactAddress] = useState('');
  const [totalSupply, setTxtTotalSupply] = useState(0);
  const [totalHolder, setTxtTotalHolders] = useState(0);
  const [recordChangesCount, setRecordChangesCount] = useState(0);

  const fetchTokens = () => {
    console.log('fetching data');

    client
      .get('/token/RetrieveTokenTable')
      .then((response) => {
        setTokens(response.data);
      })
      .catch((error) => {
        console.error('Error fetching token:', error);
      });
  };

  useEffect(() => {
    fetchTokens();
  }, [recordChangesCount]);

  useEffect(() => {
    setInterval(() => {
      fetchTokens();
    }, FIVE_MIN);
  }, []);

  const onEditClick = (_e: any, row: any) => {
    setTxtName(row.name);
    setTxtSymbol(row.symbol);
    setTxtContactAddress(row.contract_address);
    setTxtTotalSupply(row.total_supply);
    setTxtTotalHolders(row.total_holders);
  };

  const onResetButtonClick = () => {
    setTxtName('');
    setTxtSymbol('');
    setTxtContactAddress('');
    setTxtTotalSupply(0);
    setTxtTotalHolders(0);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (totalSupply < MIN_LIMIT || totalHolder < MIN_LIMIT) {
      alert('Total supply and total holders must be greater than 0!');
      return false;
    }
    if ((event.target as HTMLFormElement).checkValidity()) {
      client
        .post('/token/AddOrUpdateToken', {
          name: name,
          symbol: symbol,
          total_supply: totalSupply,
          contract_address: contactAddress,
          total_holders: totalHolder,
        })
        .then((response) => {
          if (response.data) {
            setRecordChangesCount(recordChangesCount + 1);
          }
        })
        .catch((error) => {
          console.error('Error post token:', error);
        });
      alert('Record saved successfully!');
    } else {
      alert('Form is invalid! Please check the fields...');
      return false;
    }
  };

  const pieChartData = useMemo(() => {
    console.log('tokens piechart:', tokens);
    return tokens.map((token) => ({
      id: token.rank,
      label: token.symbol,
      value: token.total_supply,
    }));
  }, [tokens]);

  const columns: GridColDef<(typeof tokens)[number]>[] = [
    { field: 'id', headerName: 'Rank', width: 90 },
    {
      field: 'symbol',
      headerName: 'Symbol',
      width: 150,
      editable: true,
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 150,
      editable: true,
    },
    {
      field: 'contract_address',
      headerName: 'Contract Address',
      width: 400,
      editable: true,
    },
    {
      field: 'total_holders',
      headerName: 'Total Holders',
      type: 'number',
      width: 140,
      editable: true,
    },
    {
      field: 'total_supply',
      headerName: 'Total Supply',
      type: 'number',
      width: 200,
      editable: true,
    },
    {
      field: 'pctg_supply',
      headerName: 'Total Supply %',
      type: 'number',
      valueFormatter: (val) => `${val}%`,
      width: 250,
      editable: true,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => {
        return (
          <Button
            href="#text-buttons"
            onClick={(e) => onEditClick(e, params.row)}
            // variant="contained"
          >
            Edit
          </Button>
        );
      },
      disableExport: true,
    },
  ];

  return (
    <Box id="displayBox" sx={{ height: 400, width: '100%' }}>
      <Grid container spacing={2}>
        <Grid size={6} className="grid">
          <Box component={'form'} onSubmit={handleSubmit} noValidate>
            <Grid size={12} className="text-left-align">
              <h3>Save / Update</h3>
            </Grid>
            <Grid container spacing={2} sx={{ marginTop: 4 }}>
              <Grid size={4} className="input-label">
                Name
              </Grid>
              <Grid size={8} className="text-left-align">
                <TextField
                  required
                  id="txtName"
                  label="Name"
                  onChange={(x) => setTxtName(x.target.value)}
                  value={name}
                  variant="standard"
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ marginTop: 4 }}>
              <Grid size={4} className="input-label">
                Symbol
              </Grid>
              <Grid size={8} className="text-left-align">
                <TextField
                  required
                  id="txtSymbol"
                  label="Symbol"
                  onChange={(x) => setTxtSymbol(x.target.value)}
                  value={symbol}
                  variant="standard"
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ marginTop: 4 }}>
              <Grid size={4} className="input-label">
                Contact Address
              </Grid>
              <Grid size={8} className="text-left-align">
                <TextField
                  required
                  id="txtContactAddress"
                  label="Contact Address"
                  onChange={(x) => setTxtContactAddress(x.target.value)}
                  value={contactAddress}
                  variant="standard"
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ marginTop: 4 }}>
              <Grid size={4} className="input-label">
                Total Supply
              </Grid>
              <Grid size={8} className="text-left-align">
                <NumericFormat
                  value={totalSupply}
                  onChange={(x) => setTxtTotalSupply(parseInt(x.target.value.replace(/,/g, '')))}
                  customInput={TextField}
                  thousandSeparator
                  valueIsNumericString
                  variant="standard"
                  label="Total Supply"
                  min="1"
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ marginTop: 4 }}>
              <Grid size={4} className="input-label">
                Total Holders
              </Grid>
              <Grid size={8} className="text-left-align">
                <NumericFormat
                  value={totalHolder}
                  onChange={(x) => setTxtTotalHolders(parseInt(x.target.value.replace(/,/g, '')))}
                  customInput={TextField}
                  thousandSeparator
                  valueIsNumericString
                  variant="standard"
                  label="Total Holders"
                />
              </Grid>
            </Grid>
            <Grid size={12} sx={{ textAlign: 'right', marginTop: 4 }}>
              <Button type="submit" variant="contained">
                Save
              </Button>
              <Button
                variant="contained"
                sx={{ backgroundColor: '#7fc7c1', marginLeft: '20px' }}
                onClick={onResetButtonClick}>
                Reset
              </Button>
            </Grid>
          </Box>
        </Grid>
        <Grid size={6} className="grid pieChart">
          <Item id="pieChart">
            <PieChart
              series={[
                {
                  data: pieChartData,
                  innerRadius: 30,
                  outerRadius: 100,
                  paddingAngle: 2,
                  cornerRadius: 5,
                  cx: 150,
                  cy: 150,
                },
              ]}
              width={500}
              height={500}
            />
          </Item>
        </Grid>
      </Grid>

      <Box sx={{ marginTop: 2 }}>
        <DataGrid
          className="dataGrid"
          rows={tokens}
          columns={columns}
          pagination
          pageSizeOptions={[10, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
          }}
          slots={{ toolbar: GridToolbar }}
        />
      </Box>
    </Box>
  );
}
