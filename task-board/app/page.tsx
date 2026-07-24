import React from 'react'
//redirect to login 
import { redirect } from 'next/navigation';
const page = () => {
  redirect("/login");
};

export default page;