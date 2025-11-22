import React, { useState, useEffect } from "react";
import axiosInstance from './axiosInstance'; 
import Swal from "sweetalert2";


interface Role {
  id: number;
  name: string;
}

const AccountCreation: React.FC = () => {
  const [role, setRoles] = useState<Role[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<number[]>([])

  useEffect(() => {
    fetchRoles();
  }, []);

  

  const fetchRoles = async () => {
    try {
      const response = await axiosInstance.get("/Role/GetAll");
      if (response.data.IsSuccess) {
        const formatted = response.data.Data.map((b: any) => ({
          id: b.Id,
          name: b.RoleName,
        }));
        setRoles(formatted);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = Array.from(e.target.selectedOptions).map((opt) => 
    Number(opt.value)
    )

    setSelectedRoles(selectedOption)
  }

  const createAccount = async () => {
    if (!name || !email || !password ) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await axiosInstance.post("/Account/CreateAccount", {
        id: 0,
        name,
        email,
        password,
        RoleIds: selectedRoles
      });

      if (response.data?.IsSuccess) {
        alert("Account created successfully");
        setName("");
        setEmail("");
        setPassword("");
        setSelectedRoles([])
      } else {
        alert("Failed to create account");
      }
    } catch (error) {
      console.error("Error creating account", error);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Create Account</h2>

      <input
        type="text"
        placeholder="Name"
        className="border w-full mb-2 p-2 rounded"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="email"
        placeholder="Email"
        className="border w-full mb-2 p-2 rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="border w-full mb-2 p-2 rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      

      <select
        className="border w-full mb-4 p-2 rounded"
        value={selectedRoles.map(String)}
        onChange={handleRoleChange}
      >
        <option value="">Select Role</option>
        {role.map((role) => (
          <option key={role.id} value={role.id}>
            {role.name}
          </option>
        ))}
      </select>

       

      <button
        onClick={createAccount}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Create Account
      </button>
    </div>
  );
};

export default AccountCreation;
