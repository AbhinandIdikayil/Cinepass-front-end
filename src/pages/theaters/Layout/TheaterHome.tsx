import { useEffect, useState } from "react";
import { DashBoardCard } from "../../../component/DashBoardCard"

import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../redux/store";
import useErrorHandler from "../../../hooks/useErrorHandler";
import { IGetScreenCount, IGetShowCountByScreen, IGetTicketCount, IRevenueResponse, Period, ResponseStatus, RevenueFilter, Role } from "../../../interface/Interface";
import { theaterGetCountStat, theaterRevenueByScreen } from "../../../redux/actions/theaterAction";
import DoughnutChart from "../../../component/chart/DoughnutChart";
import BarChart from "../../../component/chart/BarChart";

const TheaterHome = () => {
  const handleApiError = useErrorHandler(Role.theaters)
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated } = useSelector((state: RootState) => state.theaters)
  const navigate = useNavigate()


  const [screenStat, setScreenStat] = useState<IGetScreenCount | null>(null)
  const [showStat, setShowStat] = useState<IGetShowCountByScreen[]>([])
  const [screenId, setScreenId] = useState<string>()
  const [ticketStat, setTicketStat] = useState<IGetTicketCount | null>(null)
  const [screenRevenue, setScreenRevenue] = useState<IRevenueResponse | null>(null)

  const [revenueFilter, setRevenueFilter] = useState<RevenueFilter>({ period: Period.WEEK })
  const changeScreenRevenueFilter = (key: keyof RevenueFilter, value: Period|string) => {
    setRevenueFilter((prev) => ({
      ...prev,
      [key]: value,
    }));
  };


  async function fetchCountData() {
    try {
      const response = await dispatch(theaterGetCountStat()).unwrap()

      if (response.status === ResponseStatus.SUCCESS) {
        setScreenStat(response.data.screenStat)
        setShowStat(response.data.showStat)
        setTicketStat(response.data.ticketStat)
      }

    } catch (error) {
      handleApiError(error)
    }
  }


  async function fetchRevenueByScreen() {
    try {
      const response = await dispatch(theaterRevenueByScreen({ filter: revenueFilter, screenId: screenId ?? undefined })).unwrap()
      
      if (response.status === ResponseStatus.SUCCESS) {
        setScreenRevenue(response.data)
      }
    } catch (error) {
      handleApiError(error)
    } finally {

    }
  }


  async function fetchData() {
    try {

      await Promise.all([fetchCountData(), fetchRevenueByScreen()])

    } catch (error) {
      handleApiError(error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])
  useEffect(() => {
    fetchRevenueByScreen()
  }, [revenueFilter])

  return (
    <>
      <div className="screen-ticket">
        <div className="stats gap-2">
          <DashBoardCard header="screen" data={screenStat?.total ?? 0} />
          <DashBoardCard header="shows" data={showStat.length} />
          <DashBoardCard header="Tickets" data={ticketStat?.total ?? 0} />
        </div>
        <div className="flex gap-2">
          {
            screenStat &&
            < DoughnutChart label="screen" chartData={screenStat} />
          }
          {
            showStat &&
            < DoughnutChart label="shows" chartData={showStat} />
          }
          {
            ticketStat &&
            < DoughnutChart label="tickets" chartData={ticketStat} />
          }
        </div>
        {screenRevenue && <div className="p-2">
          <BarChart revenue="screen" changeFilter={changeScreenRevenueFilter} data={screenRevenue} />
        </div>}
      </div>
    </>
  )
};

export default TheaterHome