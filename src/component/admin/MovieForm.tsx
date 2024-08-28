import React, { ChangeEvent, MouseEvent, RefObject, useCallback, useEffect, useRef, useState } from "react";
import { Controller, SubmitHandler, useForm as useForms } from 'react-hook-form'

import { Action, IMovie, ResponseStatus } from "../../interface/Interface";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../redux/store";
import { addMovie, updateMovie } from "../../redux/actions/adminAction";
import { isResponseError, UploadError } from "../../utils/customError";

import { Genre, Language, MovieFormat } from "../../utils/validator";
import { movieSchema } from "../../utils/zodSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { IoCloudUploadOutline } from "react-icons/io5";
import { convertFile, getIST, setDefaultDate } from "../../utils/format";
import { MultiSelect } from "./MultiSelect";
import ConfirmationModal from "../ConfirmationModal";


export enum MovieType {
  theater = 'Theater',
  stream = 'Stream'
}
interface MovieFormProps {
  movieType: MovieType; // theater movie | streaming movie
  setToast: (alert: ResponseStatus, message: string) => void // cal back for setting toastmessage
  setModalToast: (alert: ResponseStatus, message: string) => void // cal back for setting toastmessage
  updateMovieData: (movieData: IMovie) => void // updating the movieState after adding or updating
  closeButtonRef: RefObject<HTMLDialogElement> // for closing the modal after successfull response
  selectedData?: IMovie // selected movie data
  closeModal: () => void // changing the modal view state in parent
  action: string
}

export const MovieForm: React.FC<MovieFormProps> = (
  {
    movieType,
    updateMovieData,
    closeButtonRef,
    selectedData,
    setToast,
    setModalToast,
    closeModal,
    action
  }
) => {
  console.log(selectedData, 'd')
  selectedData = selectedData ?? {
    movie_name: '',
    release_date: `${new Date()}`,
    run_time: ' ',
    genres: [],
    languages: [],
    format: [],
    cover_photo: '',
    movie_poster: '',
  }
  const {
    register,
    handleSubmit,
    clearErrors,
    reset,
    watch,
    setValue,
    control,
    setError,
    formState: { errors }
  } = useForms<IMovie>(
    {
      resolver: zodResolver(movieSchema),
      defaultValues: selectedData
    }
  )
  const dispatch = useDispatch<AppDispatch>()

  const [loading, setLoading] = useState<boolean>(false);
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [moviePoster, setMoviePoster] = useState<File | null>(null);
  const coverPhotoRef = useRef<HTMLInputElement>(null)
  const moviePosterRef = useRef<HTMLInputElement>(null)

  // const handleAddValue = (field: keyof IMovie, value: string) => {
  //   console.log('callling')
  //   const currentValues = watch(field) as string[];
  //   console.log(currentValues)
  //   const updatedArray = currentValues.includes(value)
  //     ? currentValues.filter((item) => item !== value)
  //     : [...currentValues, value];
  //   clearErrors(field)
  //   setValue(field, updatedArray);
  // };


  const handleAddValue = useCallback(
    (field: keyof IMovie, value: string) => {

      const currentValues = watch(field) as string[];
      const updatedArray = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];

      clearErrors(field);
      setValue(field, updatedArray);
    },
    []
  );
  const releaseDateRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    const min =setDefaultDate(`${new Date()}`,  1)
    const defaultDate = setDefaultDate(`${selectedData.release_date}`, action === Action.UPDATE ? 0 : 1)
    if (releaseDateRef.current) {
      releaseDateRef.current.min = min
      releaseDateRef.current.value = defaultDate
      if (action===Action.UPDATE&&new Date(selectedData.release_date) <= new Date()) {
        releaseDateRef.current.max = defaultDate
      }
    }
    setValue('release_date', defaultDate)
    if (selectedData.format.length > 0) {
      setValue('format', selectedData.format);
    }

    if (selectedData.genres.length > 0) {
      setValue('genres', selectedData.genres);
    }

    if (selectedData.languages.length > 0) {
      setValue('languages', selectedData.languages);
    }

  }, []);
  
  const [addFormData, setAddFormData] = useState<IMovie | null>(null);
  const [updateFormData, setUpdateFormData] = useState<IMovie | null>(null);

  const handleFormSubmit: SubmitHandler<IMovie> = (data) => {
    setConfirmation(true)
    action === Action.ADD ?
      setAddFormData(data)
      : setUpdateFormData(data)
  }

  const addMovieSubmit = () => {
    addFormData ? onSubmit(addFormData) : null

  }
  const updateMovieSubmit = () => {
    updateFormData ? onSubmit(updateFormData) : null
  }


  const openFile = (e: MouseEvent<HTMLButtonElement>, imageField: string) => {
    e.preventDefault()
    e.stopPropagation()

    imageField === 'movie_poster' ?
      moviePosterRef.current?.click()
      : coverPhotoRef.current?.click();

  }



  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>, imageType: string) => {
    e.preventDefault();
    const file = e.target.files?.[0] || null;

    imageType === 'cover_photo' ?
      setCoverPhoto(file || null)
      : setMoviePoster(file || null)

    file ?
      convertFile(file)
        .then((result) => {
          setValue(imageType as keyof IMovie, result)
          clearErrors(imageType as keyof IMovie)
        })
        .catch((error) => {
          if (error instanceof UploadError) {
            setModalToast(ResponseStatus.ERROR, error.message)
          }
        })
      : null
  }


  const onSubmit = async (movieData: IMovie) => {
    console.log('form submission stated', movieData)
    try {
      setLoading(true)
      clearErrors()
      let response
      if (action === Action.ADD) {
        response = await dispatch(addMovie({ movieData, movieType: MovieType.theater })).unwrap();

      } else if (action === Action.UPDATE && selectedData._id) {
        response = await dispatch(updateMovie({ payload: movieData, movieType: MovieType.theater, movieId: selectedData._id })).unwrap()
      }
      if (response?.status === ResponseStatus.SUCCESS) {
        setToast(ResponseStatus.SUCCESS, response.message);
        updateMovieData(response.data.movie)
        closeButtonRef.current?.close()
        clearErrors()
        reset()
        closeModal()
        action === Action.ADD ?
          setAddFormData(null) : setUpdateFormData(null)
      }

    } catch (err) {

      //error during upload the image
      if (err instanceof UploadError) {
        setModalToast(ResponseStatus.ERROR, err.message) // need to set as modal Toast
      }

      //error during the submission
      else if (isResponseError(err)) {
        if (err.statusCode === 413) {
          setModalToast(ResponseStatus.ERROR, err.data.message) /// need to set as a modal toast
        }
        setError(
          err.data.error as keyof IMovie,
          {
            message: err.data.message
          })

      }

    } finally {
      setLoading(false)
    }


  }

  const [confirmation, setConfirmation] = useState(false)
  const closeConfirmationModal = () => setConfirmation(false)

  return (
    <>
      {
        confirmation &&
        <
          ConfirmationModal
          btnType={ResponseStatus.SUCCESS}
          isOpen={confirmation}
          message={`Are your sure want to ${action} this movie`}
          onClose={closeConfirmationModal}
          onConfirm={action === Action.ADD ? addMovieSubmit : updateMovieSubmit}
        />
      }


      <form className="grid grid-cols-1 gap-4 p-3" onSubmit={handleSubmit(handleFormSubmit)}>

        {/* movie name */}
        <div className="relative col-span-2">
          <label className=" label block mb-2" htmlFor="movie_name">Movie Name</label>
          <Controller
            name="movie_name"
            control={control}
            render={({ field }) => (
              <input
                className="relative input input-bordered w-full max-w-md"
                type="text"
                placeholder="Enter movie name"
                {...field}
              />
            )}
          />
          {errors.movie_name &&
            <small
              className='text-red-600 capitalize absolute left-0 -bottom-6 font-mono '
            >{errors.movie_name.message}</small>
          }

        </div>

        {/* multi Select componet */}
        <div className="relative flex  gap-2 items-center">
          <div className="flex relative flex-col">
            <label className="label">Genres</label>
            <MultiSelect
              field="genres"
              defaultValues={Object.values(Genre)}
              handleAddValue={handleAddValue}
              selected={selectedData.genres}
            />
            {errors.genres &&
              <small
                className='text-red-600 capitalize absolute left-0 -bottom-5 font-mono '
              >{errors.genres.message}</small>}

          </div>
          <div className="relative flex flex-col">
            <label className="label">Language</label>
            <MultiSelect
              field={'languages'}
              defaultValues={Object.values(Language)}
              handleAddValue={handleAddValue}
              selected={selectedData.languages}
            />
            {errors.languages &&
              <small
                className='text-red-600 capitalize absolute left-0 -bottom-5 font-mono '
              >{errors.languages.message}</small>}

          </div>
          <div className="relative flex flex-col">
            <label className="label">Select Format</label>
            <MultiSelect
              field={'format'}
              defaultValues={Object.values(MovieFormat)}
              handleAddValue={handleAddValue}
              selected={selectedData.format}
            />
            {errors.format &&
              <small
                className='text-red-600 capitalize absolute left-0 -bottom-5 font-mono '
              >{errors.format.message}</small>}

          </div>
        </div>
        {movieType === MovieType.stream && (
          <div className="relative col-span-2">
            <label className="label block mb-2">Choose plan</label>
            <select name="plan" id="plan" className="select">
              <option value="">Select plan</option>
              <option value="basic">Basic</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
            </select>
          </div>
        )}

        {/* release date */}
        <div className="relative col-span-2">
          <label className="label block mb-2">Release Date</label>
          <Controller
            name="release_date"
            control={control}
            render={({ field }) => (
              <input
                ref={releaseDateRef}
                className="input input-bordered w-full max-w-xs"
                type="date"
                id="release_date"
                {...register}
                placeholder="release date"
                onChange={(e) => {
                  field.onChange(e);
                }}
              />
            )}
          />
          {errors.release_date &&
            <small className='text-red-600 capitalize absolute left-0 -bottom-5 font-mono '
            >{errors.release_date.message}</small>}

        </div>

        {/* run time */}
        <div className="relative col-span-2">
          <label className="label block mb-2">Run time</label>
          <Controller
            name="run_time"
            control={control}
            render={({ field }) => (
              <input
                type="number"
                className="input input-bordered w-full max-w-xs"
                placeholder="Movie running time (minutes)"
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                }}
              />
            )}
          />
          {errors.run_time &&
            <small
              className='text-red-600 capitalize absolute left-0 -bottom-5 font-mono '
            >{errors.run_time.message}</small>}
        </div>

        {/* Movie Poster */}
        <div className="relative col-span-2 my-5">
          <label
            className=" gap-3  bg-sky-300 p-2 mb-2 rounded-md "

          >
            Movie Poster
          </label>

          <button type="button" onClick={(e) => openFile(e, 'movie_poster')} className="ml-2">
            <IoCloudUploadOutline size={20} />

          </button>
          <input
            type="file"
            id="movie_poster"
            ref={moviePosterRef}
            onChange={(e) => handleImageUpload(e, 'movie_poster')}
            accept="image/*,.jpg,.jpeg,.avif"
            className="hidden"
          />
          {errors.movie_poster && (
            <small className="text-red-600 absolute left-0 -bottom-6 font-mono">
              {errors.movie_poster.message}
            </small>
          )}
        </div>

        {/* Cover Photo */}
        <div className="relative col-span-2 mb-3">
          <label
            className=" gap-3  bg-sky-300 p-2 mb-2 rounded-md "

          >
            Cover Photo
          </label>
          <button type="button" onClick={(e) => openFile(e, 'cover_photo')} className="ml-2">
            <IoCloudUploadOutline size={20} />
          </button>
          <input
            type="file"
            id="cover_photo"
            ref={coverPhotoRef}
            onChange={(e) => handleImageUpload(e, 'cover_photo')}
            accept="image/*,.jpg,.jpeg,.avif"
            className="hidden"
          />

          {errors.cover_photo && (
            <small className="text-red-600 absolute left-0 -bottom-6 font-mono">
              {errors.cover_photo.message}
            </small>
          )}
        </div>

        < div className="text-center">
          <button
            type='submit'
            className="mt-3 btn bg-cyan-400 hover:bg-cyan-500 w-2/3"
            disabled={loading}
          >
            {
              !loading ? ('SUBMIT')
                :
                (
                  <span className="loading loading-bars loading-md"></span>
                )
            }</button>

        </div>
      </form >
    </>
  );
}
export default MovieForm;

