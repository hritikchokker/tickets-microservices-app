import { useState } from "react";
import Router from "next/router";
import useRequest from "../../hooks/use-request";
const Signup = () => {
  const [userForm, setUserForm] = useState({
    email: "",
    password: "",
  });
  const { doRequest, errors } = useRequest({
    url: "api/users/signup",
    method: "post",
    body: userForm,
    onSuccess: () => Router.push("/"),
  });
  const handleChange = (event) => {
    event.preventDefault();
    if (event && event.target) {
      const { name, value } = event.target;
      setUserForm({
        ...userForm,
        [name]: value,
      });
    }
  };
  const registerUser = async () => {
    try {
      await doRequest();
    } catch (error) {}
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    registerUser();
  };
  return (
    <form onSubmit={handleSubmit}>
      <h1>Sign up</h1>
      <div className="form-group">
        <label>Email Address</label>
        <input name="email" onChange={handleChange} className="form-control" />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input
          onChange={handleChange}
          name="password"
          type="password"
          className="form-control"
        />
      </div>
      {errors}
      <button className="btn btn-primary">Sign Up</button>
    </form>
  );
};

export default Signup;
