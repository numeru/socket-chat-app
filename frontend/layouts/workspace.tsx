import React, { useCallback, ReactNode } from 'react';
import fetcher from '@utils/fetcher';
import axios from 'axios';
import useSWR from 'swr';
import { Redirect } from 'react-router';

type Props = {
  children: ReactNode;
};

const Workspace = ({ children }: Props) => {
  const { data: userData, error, revalidate, mutate } = useSWR('/api/users', fetcher);

  const onLogout = useCallback(() => {
    axios
      .post('/api/users/logout', null, {
        withCredentials: true,
      })
      .then(() => {
        mutate(false, false);
      });
  }, []);

  if (!userData) {
    return <Redirect to="/login" />;
  }

  return (
    <div>
      work space
      <button onClick={onLogout}>로그아웃</button>
      {children}
    </div>
  );
};

export default Workspace;
