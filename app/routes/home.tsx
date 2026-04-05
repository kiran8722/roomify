import type { Route } from "./+types/home";
import Navbar from "../../components/navbar";



export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
     <div className="home">
       <Navbar></Navbar>
       <h1 className="text-3xl text-yellow-400">Home </h1>
     </div>
  );
}
