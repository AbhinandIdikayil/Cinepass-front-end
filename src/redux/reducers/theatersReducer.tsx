import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IInitialState } from "./IState";
import { createTheaterScreen, getAllShows, getScreen, getTheaterDetails, loginTheaters, logoutTheaters, signupTheaters, theaterGetCountStat, theaterRevenueByScreen, updateTheater, } from "../actions/theaterAction";
import { IInitialStateError, ResponseData } from "../../interface/Interface";
import { IResponseError, isResponseError } from "../../utils/customError";
import { LoggedOwner } from "../../interface/user/IUserData";
import { HttpStatusCode } from "axios";

const initialState: IInitialState = {
  profile: null,
  error: null,
  tempMail: null,
  isAuthenticated: false

}

const theaterSlice = createSlice({
  name: 'theaters',
  initialState,
  reducers: {
    theaterClearError(state: IInitialState) {
      state.error = null

    },

    theaterSetError(state: IInitialState, action: PayloadAction<IInitialStateError>) {
      state.error = action.payload

    },
    theaterSetIsAuthenticated(state: IInitialState) {
      state.isAuthenticated = !state.isAuthenticated

    },
    TheaterClearTempMail(state: IInitialState) {
      state.tempMail = null

    }
  },
  extraReducers: (builder) => {
    builder
      //signup
      .addCase(signupTheaters.pending, (state: IInitialState) => {

        state.error = null;
      })
      .addCase(signupTheaters.fulfilled, (state: IInitialState, action: PayloadAction<ResponseData>) => {
 
        state.tempMail = action.payload.data ? action.payload.data as { email: string } : null
      })
      .addCase(signupTheaters.rejected, (state: IInitialState, action) => {

        if (isResponseError(action.payload)) {
          if (action.payload.statusCode === HttpStatusCode.Unauthorized && action.payload.data.error === 'otp') {
            state.tempMail = action.payload.data ? action.payload.data.tempMail as { email: string } : null
          }
        }
      })


      //login
      .addCase(loginTheaters.fulfilled, (state: IInitialState, action) => {

        state.error = null;
        state.isAuthenticated = true;
        state.profile = action.payload.data ? action.payload.data as unknown as LoggedOwner : null
      })
      .addCase(loginTheaters.rejected, (state: IInitialState) => {
        state.profile = null
        state.isAuthenticated = false
      })



      //logout
      .addCase(logoutTheaters.pending, (state: IInitialState) => {
        state.error = null
      })
      .addCase(logoutTheaters.fulfilled, (state: IInitialState) => {

        state.error = null;
        state.isAuthenticated = false
        state.profile = null
      })
      .addCase(logoutTheaters.rejected, (state: IInitialState, action) => {

        state.error = action.payload as IInitialStateError | null
      })


      //create theater screen

      .addCase(createTheaterScreen.rejected, (state: IInitialState, action) => {

        isResponseError(action.payload) ?
          handleRejectedCase(state, action.payload) : null

      })
      //get theater screen  

      .addCase(getScreen.rejected, (state: IInitialState, action) => {

        isResponseError(action.payload) ?
          handleRejectedCase(state, action.payload) : null
      })
      //get theater details

      .addCase(getTheaterDetails.rejected, (state: IInitialState, action) => {
        isResponseError(action.payload) ?
          handleRejectedCase(state, action.payload) : null
      })
      //update theater details

      .addCase(updateTheater.rejected, (state: IInitialState, action) => {
        isResponseError(action.payload) ?
          handleRejectedCase(state, action.payload) : null
      })

      //get all shows
      .addCase(getAllShows.rejected, (state: IInitialState, action) => {
        isResponseError(action.payload) ?
          handleRejectedCase(state, action.payload) : null
      })

      //get theater count status data
      .addCase(theaterGetCountStat.rejected, (state: IInitialState, action) => {
        isResponseError(action.payload) ?
          handleRejectedCase(state, action.payload) : null
      })
      .addCase(theaterRevenueByScreen.rejected, (state: IInitialState, action) => {
        isResponseError(action.payload) ?
          handleRejectedCase(state, action.payload) : null
      })

  }
})
export const {
  TheaterClearTempMail, theaterClearError,
  theaterSetError, theaterSetIsAuthenticated,
} = theaterSlice.actions
export default theaterSlice.reducer


export function handleRejectedCase(state: IInitialState, payload: IResponseError) {

  if (

    payload.statusCode === HttpStatusCode.Forbidden
    || payload.statusCode === HttpStatusCode.Unauthorized

  ) {
    state.isAuthenticated = false;
    state.profile = null
    if (payload.statusCode === HttpStatusCode.Forbidden) {
      state.bookingInfo = null
    }
  }
}