import { memo } from "react";
import { IGetSingleShow } from "../../interface/Interface"
import { convertTo12HourFormat, getDate, getDayName, getMonthName } from "../../utils/format";

interface ITicketInfoProps {
  showDetails: IGetSingleShow;
  bookingDate: string;
  selectedSeats: string[]
}
const TicketInfo: React.FC<ITicketInfoProps> = ({ showDetails, bookingDate, selectedSeats }) => {
  return (
    <div className="ticket-summary  p-2 m-2 ">
      <div className="bg-base-100  rounded-md">
        <div className="hero-content gap-10 justify-start">
          <div className="w-48  ">
            <img
              src={showDetails.movie.movie_poster}
              className=" h-full w-full object-contain  rounded-lg shadow-2xl"
            />
          </div>
          <div className="join mt-2 flex-col gap-2">
            <h1 className="text-2xl font-bold capitalize">{showDetails.movie.movie_name}</h1>
            <div className="join text-md items-center gap-3 capitalize ">
              <span className="badge rounded-none ">{showDetails.show.language}</span>
              <span className="badge rounded-none">{showDetails.show.format}</span>
            </div>
            <h6 className="text-sm tracking-wider mt-3 ">{`${showDetails.theater.theater_name}`}</h6>


            <div className="grid grid-cols-3 gap-3 justify-between items-center mt-3">
              <div className="col-span-2">
                <h2 className="font-extrabold tracking-wide text-lg">
                  {
                    `${getDayName(bookingDate)}, `
                    + `${getDate(bookingDate)} `
                    + `${getMonthName(bookingDate)}, `
                    + `${convertTo12HourFormat(showDetails.show.showTime as string)}`
                  }
                </h2>
                <h2 className="font-bold tracking-wide text-gray-400">
                  {
                    `${showDetails.screen.screen_name}, `
                    + `${selectedSeats.join(' ')}`
                  }
                </h2>
              </div>
              <div className="btn btn-active cursor-none flex flex-col ">
                <span>{selectedSeats.length}</span>
                <span>TICKET</span>
              </div  >
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(TicketInfo)