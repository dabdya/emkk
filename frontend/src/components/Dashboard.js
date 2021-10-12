import React from 'react';
import { getUser, removeUserSession } from '../utils/Common';

function Dashboard(props) {
  const user = getUser();

  // handle click event of logout button
  const handleLogout = () => {
    removeUserSession();
    props.history.push('/login');
  };

  return (
    <div>
      Welcome {user}!<br /><br />
      Здесь находится информация только для авторизованных пользователей <br /> <br/>
      <input type="button" onClick={handleLogout} value="Logout" />
    </div>
  );
}

export default Dashboard;