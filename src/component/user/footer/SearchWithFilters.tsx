import React, { MouseEvent, useState } from "react"
import { CiSearch } from "react-icons/ci"
import { IoLocation } from "react-icons/io5";
import { IoIosArrowDropdown } from "react-icons/io";
 
import { useNavigate } from "react-router-dom";
import LocationModal from "../../../pages/user/LocationModal";
import  type { Rootstate } from "../../../redux/store";
import { useSelector } from "react-redux";

export const SearchWithFilters: React.FC = () => {

  const { city } =  useSelector((state:RootState)=>state.user)
  const [locationModal, setLocationModal] = useState(false)
  const navigate = useNavigate();

  if (!city) {
    navigate('/')
  }

  const showModal = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setLocationModal(true)
  }

  const onClose = () => {
    setLocationModal(false);
  }

  return (
    <>
      <div className='w-full   p-2 bg-white hidden sm:flex justify-between items-center relative group'>

        <div className="w-72 h-9 p-1 bg-blue-100 flex justify-evenly rounded-md">
          <button className="w-full h-full p-1 capitalize text-sm text-slate-800">now showing</button>
          <button className="w-full h-full p-1 bg-white rounded-sm capitalize text-sm text-slate-800">Upcoming</button>
        </div>

        <div className="relative">
          <CiSearch size={20} className="absolute top-2.5 left-2 text-gray-400" />
          <input type="search" placeholder="search movie, theater..." className="pl-10 pr-4 w-full h-9 placeholder-gray-400 text-gray-900 focus:outline-none" />
        </div>

        <div className="relative flex items-center p-1 w-40 border-2">
          <IoLocation />
          <button onClick={showModal} className="b-2   w-full h-full">{city}</button>
          {locationModal && < LocationModal onClose={onClose} />}
          <IoIosArrowDropdown />
        </div>
      </div>
    </>
  )
}