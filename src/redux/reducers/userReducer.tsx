import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { bookTickets, cancelUserPayment, getAllMovies, getAllShows, getSingleMovie, getTheatersByCity, getUserProfile, getUserTickets, googleSignUp, loginUser, logoutUser, signUpUser, updateUserProfile, userGetHlsUrl, userPurchaseStream, } from "../actions/userAction";
import { IInitialState } from "./IState";
import { IInitialStateError, } from "../../interface/Interface";
import { isErrorResponse, isResponseError } from "../../utils/customError";
import { handleRejectedCase } from "./theatersReducer";
import { HttpStatusCode } from "axios";


const initialState: IInitialState = {
  profile: null,
  error: null,
  isAuthenticated: false,
  tempMail: null,
  isGoogleAuth: false,
  city: undefined,
  movies: null,
  cityTheaters: [],
  bookingInfo: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    userClearError(state: IInitialState) {
      state.error = null;

    },
    userSetError(state: IInitialState, action: PayloadAction<IInitialStateError>) {
      state.error = action.payload

    },
    userSetIsAuthenticated(state: IInitialState) {
      state.isAuthenticated = !state.isAuthenticated

    },
    userSetCity(state: IInitialState, action: PayloadAction<string>) {
      state.city = action.payload

    },
    userClearTempMail(state: IInitialState) {
      state.tempMail = null

    },
    userResetBookingInfo(state: IInitialState) {
      state.bookingInfo = null
    }
  },
  extraReducers: (builder) => {
    builder

      //singup
      .addCase(signUpUser.pending, (state: IInitialState) => {
        state.error = null;
      })
      .addCase(signUpUser.fulfilled, (state: IInitialState, action) => {

        state.tempMail = action.payload.data ? action.payload.data as { email: string } : null
      })
      .addCase(signUpUser.rejected, (state: IInitialState, action) => {

        if (isErrorResponse(action.payload)) {
          state.error = action.payload.error as IInitialStateError | null
        }
      })

      //login
      .addCase(loginUser.pending, (state: IInitialState) => {
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state: IInitialState) => {
        state.error = null
        state.isAuthenticated = true
      })
      .addCase(loginUser.rejected, (state: IInitialState, action) => {
        if (isResponseError(action.payload)) {
          if (action.payload.statusCode === HttpStatusCode.Unauthorized && action.payload.data.error === 'otp') {
            state.tempMail = action.payload.data ? action.payload.data.tempMail as { email: string } : null
          }
        }
      })

      //google login
      .addCase(googleSignUp.pending, (state: IInitialState) => {

        state.error = null
      })
      .addCase(googleSignUp.fulfilled, (state: IInitialState, action) => {

        state.error = null
        state.isAuthenticated = true
        state.profile = action.payload.data.user
        state.isGoogleAuth = true
      })

      //logout

      .addCase(logoutUser.fulfilled, (state: IInitialState) => {
        state.error = null
        state.isAuthenticated = false;
        state.profile = null
      })

      .addCase(logoutUser.rejected, (state: IInitialState, action) => {

        if (isErrorResponse(action.payload)) {
          state.error = action.payload.error as IInitialStateError | null
        }
      })

      //get all shows running in current city 
      .addCase(getAllShows.rejected, (state: IInitialState, action) => {

        if (isResponseError(action.payload)) {
          if (action.payload.statusCode === HttpStatusCode.Forbidden || action.payload.statusCode === HttpStatusCode.Unauthorized) {
            state.isAuthenticated = false
          }
        }
      })

      //get single movie
      .addCase(getSingleMovie.rejected, (state: IInitialState, action) => {

        if (isResponseError(action.payload)) {
          if (action.payload.statusCode === HttpStatusCode.Forbidden || action.payload.statusCode === HttpStatusCode.Unauthorized) {
            state.isAuthenticated = false
          }
        }
      })

      //ge tuser profile
      .addCase(getUserProfile.fulfilled, (state: IInitialState, action) => {
        state.profile = action.payload.data.user
      })
      .addCase(getUserProfile.rejected, (state: IInitialState, action) => {
        isResponseError(action.payload) ?
          handleRejectedCase(state, action.payload) : null
      })

      //update user profile
      .addCase(updateUserProfile.fulfilled, (state: IInitialState, action) => {
        state.profile = action.payload.data.user
      })
      .addCase(updateUserProfile.rejected, (state: IInitialState, action) => {
        isResponseError(action.payload) ?
          handleRejectedCase(state, action.payload) : null
      })

      //get all movies
      .addCase(getAllMovies.fulfilled, (state: IInitialState, action) => {
        state.movies = action.payload.length ? action.payload : null
      })
      .addCase(getAllMovies.rejected, (state: IInitialState, action) => {
        if (isResponseError(action.payload)) {
          if (action.payload.statusCode === HttpStatusCode.NotFound) {
            state.movies = undefined
            state.cityTheaters = undefined
          } else {
            handleRejectedCase(state, action.payload)
          }
        }
      })

      //get theater by city
      .addCase(getTheatersByCity.fulfilled, (state: IInitialState, action) => {
        state.cityTheaters = action.payload.data.theater
      })
      .addCase(getTheatersByCity.rejected, (state: IInitialState, action) => {
        if (isResponseError(action.payload)) {
          if (action.payload.statusCode === HttpStatusCode.NotFound) {
            state.movies = undefined
            state.cityTheaters = undefined
          } else {
            handleRejectedCase(state, action.payload)
          }
        }
      })

      //get  user ticket data
      .addCase(getUserTickets.rejected, (state: IInitialState, action) => {
        isResponseError(action.payload) ?
          handleRejectedCase(state, action.payload) : null
      })

      //cancel user payment
      .addCase(cancelUserPayment.rejected, (state: IInitialState, action) => {
        isResponseError(action.payload) ?
          handleRejectedCase(state, action.payload) : null
      })

      //user ticket booking payment
      .addCase(bookTickets.pending, (state: IInitialState, payload) => {

        if (!state.isAuthenticated) {
          state.bookingInfo = payload.meta.arg
        }

      })
      .addCase(bookTickets.rejected, (state: IInitialState, action) => {

        isResponseError(action.payload) ?
          handleRejectedCase(state, action.payload) : null
      })

      //purchase user stream
      .addCase(userPurchaseStream.rejected, (state: IInitialState, action) => {
        isResponseError(action.payload) ?
          handleRejectedCase(state, action.payload) : null
      })

      .addCase(userGetHlsUrl.rejected, (state: IInitialState, action) => {
        isResponseError(action.payload) ?
          handleRejectedCase(state, action.payload) : null
      })
  },

});

export const {
  userClearError,
  userSetError,
  userSetIsAuthenticated,
  userSetCity,
  userClearTempMail,
  userResetBookingInfo

} = userSlice.actions

export default userSlice.reducer