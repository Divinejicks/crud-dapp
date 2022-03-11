import {useState} from 'react';
import {ethers} from 'ethers';
import 'antd/dist/antd.min.css';
import './App.css';
import { Table, Space, Button, Modal, Card } from 'antd';

import Crud from './artifacts/contracts/Crud.sol/Crud.json';
import UpdateMode  from './models/update-mode.enum';

const { Column } = Table;
//const crudAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; //localhost
const crudAddress = "0x7b2c6059598d99b88643e375EfE39a5f092C722a"; //Ropsten

function App() {

  const [name, setNameValue] = useState('');
  const [id, setId] = useState(0);
  const [result, setResult] = useState('');
  const [users, setUsers] = useState();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [updateMode, setUpdateMode] = useState(UpdateMode.ADD);

  const showModal = async (_id) => {
    await setId(_id);
    await setUpdateMode(UpdateMode.EDIT);
    setIsModalVisible(true);
  };

  const handleOk = async () => {
   if(updateMode === UpdateMode.EDIT){
    await updateUser();
   }
   else{
     await createUser();
   }
    setIsModalVisible(false);
    await readUsers();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const connect = async () => {
    await window.ethereum
      .request({method: 'eth_requestAccounts'});
  }

  const contractProvider = () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(crudAddress, Crud.abi, provider);
    return contract;
  }

  const contractSigner = async () => {
    await connect();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(crudAddress, Crud.abi, signer);
    return contract;
  }

  const createUser = async () => {
    if(!name) return;
    if(typeof window.ethereum !== 'undefined'){
      const contract = await contractSigner()
      const transaction = await contract.create(name);
      setNameValue('')
      await transaction.wait();
      setResult("User created successfully");
    }
  }

  const readUser = async () => {
    if(typeof window.ethereum !== 'undefined'){
      const contract = await contractProvider()
      contract.read(id)
        .then(user => {
          setResult(`Id: ${user[0]} Name: ${user[1]}`);
          setId('')
        })
        .catch(() => {
          setResult(`There was a problem trying to read user with Id: ${id}`);
        })
    }
  }

  const readUsers = async () => {
    if(typeof window.ethereum !== 'undefined'){
      const contract = await contractProvider()
      contract.readAll()
        .then(_users => {
          setUsers(_users);
        })
        .catch(() => {
          setResult(`There was a problem trying to read all the users`);
        })
    }
  }

  const updateUser = async () => {
    if(!name || !id) return;
    if(typeof window.ethereum !== 'undefined'){
      const contract = await contractSigner();
      const transaction = await contract.update(id,name)
      await transaction.wait();
      setNameValue('')
      setResult(`User with Id: ${id} has been updated successfully`);
    } 
  }

  const deleteUser = async (_id) => {
    await setId(_id)
    if(!id) return;
    if(typeof window.ethereum !== 'undefined'){
      const contract = await contractSigner();
      const transaction = await contract.destroy(id);
      await transaction.wait();
      setResult(`user with id: ${id} had been deleted successfully`);
      readUsers();
    }
  }

  return (
    <div className='App'>
      <Card className='card-design' title="List all users">
        <Space size="middle">
          <Button onClick={readUsers}>List Users</Button>
          <Button onClick={() => setIsModalVisible(true)}>Create new user</Button>
        </Space>
        <br></br>
        <br></br>
        <p>{result}</p>
        <Table dataSource={users} rowKey={'id'}>
          <Column title="Name" dataIndex="name" key="name" />
          <Column title="Action" key="action"
            render={(record) => (
              record.id.toNumber() > 0 && <Space size="middle">
                <Button onClick={() => showModal(record.id.toNumber())}> Update</Button>
                <Button onClick={() => deleteUser(record.id.toNumber())}> Delete</Button> 
              </Space>
            )} />
        </Table>

        <Modal title="Update User" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
          <input onChange={e => setNameValue(e.target.value)}
            placeholder="Set new Name"
            value={name} />
        </Modal>
      </Card>
    </div>
  );
}

export default App;
