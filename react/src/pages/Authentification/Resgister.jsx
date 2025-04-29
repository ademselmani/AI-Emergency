import React, { useState, useRef, useEffect } from "react"
import axios from "axios"
import { Eye, EyeOff, Camera } from "lucide-react"

const Register = () => {
  const initialFormState = {
    cin: "",
    name: "",
    familyName: "",
    gender: "",
    email: "",
    role: "",
    phone: "",
    password: "",
    image: null,
  }

  const [previewImage, setPreviewImage] = useState(null);

  const [formData, setFormData] = useState(initialFormState)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const fileInputRef = useRef(null)

  useEffect(() => {
    setFormData(initialFormState)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [])

  const validateField = (name, value) => {
    const newErrors = {}
    switch (name) {
      case "cin":
        if (!value) newErrors.cin = "CIN is required"
        else if (!/^\d{8}$/.test(value))
          newErrors.cin = "CIN must be exactly 8 digits"
        break
      case "name":
        if (!value) newErrors.name = "First Name is required"
        else if (value.length < 2)
          newErrors.name = "First Name must be at least 2 characters"
        break
      case "familyName":
        if (!value) newErrors.familyName = "Last Name is required"
        else if (value.length < 2)
          newErrors.familyName = "Last Name must be at least 2 characters"
        break
      case "gender":
        if (!value) newErrors.gender = "Gender is required"
        break
      case "email":
        if (!value) newErrors.email = "Email is required"
        else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value))
          newErrors.email = "Please enter a valid email"
        break
      case "role":
        if (!value) newErrors.role = "Role is required"
        break
      case "phone":
        if (!value) newErrors.phone = "Phone is required"
        else if (!/^\+?[1-9]\d{1,14}$/.test(value))
          newErrors.phone =
            "Please enter a valid phone number with country code"
        break
      case "password":
        if (!value) newErrors.password = "Password is required"
        else if (value.length < 8)
          newErrors.password = "Password must be at least 8 characters"
        break
      default:
        break
    }
    return newErrors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === "cin") {
      const numericValue = value.replace(/\D/g, "").slice(0,8)
      setFormData((prev) => ({ ...prev, [name]: numericValue }))
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return { ...newErrors, ...validateField(name, numericValue) }
      })
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return { ...newErrors, ...validateField(name, value) }
      })
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    setFormData((prev) => ({ ...prev, image: file }))
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors.image
      if (!file) newErrors.image = "Please upload an image"
      return newErrors
    })
  }

  const handleCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      const video = document.createElement("video")
      video.srcObject = stream
      video.play()
      const canvas = document.createElement("canvas")
      const context = canvas.getContext("2d")
      video.onplaying = () => {
        setTimeout(() => {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          context.drawImage(video, 0, 0, canvas.width, canvas.height)
          canvas.toBlob((blob) => {
            const file = new File([blob], "profile.jpg", { type: "image/jpeg" })
            setFormData((prev) => ({ ...prev, image: file }))
            setErrors((prev) => ({ ...prev, image: "", camera: "" }))
            if (fileInputRef.current) {
              const dataTransfer = new DataTransfer()
              dataTransfer.items.add(file)
              fileInputRef.current.files = dataTransfer.files
            }
          }, "image/jpeg")
          stream.getTracks().forEach((track) => track.stop())
        }, 1000)
      }
    } catch (error) {
      setErrors((prev) => ({ ...prev, camera: "Unable to access the camera." }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    let newErrors = {}
    Object.keys(formData).forEach((key) => {
      if (key !== "image") {
        newErrors = { ...newErrors, ...validateField(key, formData[key]) }
      }
    })
    if (!formData.image) {
      newErrors.image = "Please upload an image"
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setStatusMessage("Please fix the highlighted errors")
      return
    }
    setLoading(true)
    setStatusMessage("Processing registration...")
    try {
      const formDataToSend = new FormData()
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key])
        }
      })
      const response = await axios.post(
        "http://localhost:3000/api/auth/signup",
        formDataToSend,
        { headers: { "Content-Type": "multipart/form-data" } }
      )
      if (response.status === 201) {
        setStatusMessage("Registration successful!")
        setFormData(initialFormState)
        setErrors({})
        if (fileInputRef.current) fileInputRef.current.value = ""
      }
    } catch (err) {
      console.error("Registration error:", err)
      const errorResponse = err.response?.data
      if (errorResponse?.errors) {
        setErrors(errorResponse.errors)
      } else {
        setErrors({
          general:
            errorResponse?.message || "Registration failed. Please try again.",
        })
      }
      setStatusMessage("Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='authentication-wrapper authentication-basic container-p-y'>
      <div className='authentication-inner'>
        <div className='card'>
          <div className='card-body'>
            <div className='app-brand justify-content-center'>
              <span className='app-brand-text demo text-body fw-bolder'>
                Create an employee
              </span>
            </div>

            {errors.general && (
              <div
                className='alert alert-danger alert-dismissible fade show'
                role='alert'
              >
                {errors.general}
                <button
                  type='button'
                  className='btn-close'
                  onClick={() =>
                    setErrors((prev) => ({ ...prev, general: "" }))
                  }
                ></button>
              </div>
            )}

            {statusMessage && (
              <div
                className={`alert ${
                  loading ? "alert-info" : "alert-success"
                } alert-dismissible fade show`}
                role='alert'
              >
                {statusMessage}
                {loading && (
                  <div
                    className='spinner-border spinner-border-sm text-primary ms-2'
                    role='status'
                  >
                    <span className='visually-hidden'>Loading...</span>
                  </div>
                )}
                {!loading && (
                  <button
                    type='button'
                    className='btn-close'
                    onClick={() => setStatusMessage("")}
                  ></button>
                )}
              </div>
            )}

            <form
              id='formAuthentication'
              className='mb-3'
              onSubmit={handleSubmit}
            >
              <input
                type='email'
                name='preventAutofill1'
                style={{ display: "none" }}
              />
              <input
                type='password'
                name='preventAutofill2'
                style={{ display: "none" }}
              />

              <div className='mb-3'>
                <label htmlFor='cin' className='form-label'>
                  CIN <span className='text-danger'>*</span>
                </label>
                <input
                  type='text'
                  inputMode='numeric'
                  pattern='\d{8}'
                  className={`form-control ${errors.cin ? "is-invalid" : ""}`}
                  id='cin'
                  name='cin'
                  placeholder='Enter 8-digit CIN'
                  value={formData.cin}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.cin && (
                  <div className='invalid-feedback'>{errors.cin}</div>
                )}
              </div>

              <div className='mb-3'>
                <label htmlFor='name' className='form-label'>
                  First Name <span className='text-danger'>*</span>
                </label>
                <input
                  type='text'
                  className={`form-control ${errors.name ? "is-invalid" : ""}`}
                  id='name'
                  name='name'
                  placeholder='Enter your first name'
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.name && (
                  <div className='invalid-feedback'>{errors.name}</div>
                )}
              </div>

              <div className='mb-3'>
                <label htmlFor='familyName' className='form-label'>
                  Last Name <span className='text-danger'>*</span>
                </label>
                <input
                  type='text'
                  className={`form-control ${
                    errors.familyName ? "is-invalid" : ""
                  }`}
                  id='familyName'
                  name='familyName'
                  placeholder='Enter your last name'
                  value={formData.familyName}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.familyName && (
                  <div className='invalid-feedback'>{errors.familyName}</div>
                )}
              </div>

              <div className='mb-3'>
                <label htmlFor='gender' className='form-label'>
                  Gender <span className='text-danger'>*</span>
                </label>
                <select
                  className={`form-control ${
                    errors.gender ? "is-invalid" : ""
                  }`}
                  id='gender'
                  name='gender'
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value=''>Select gender</option>
                  <option value='Man'>Man</option>
                  <option value='Woman'>Woman</option>
                </select>
                {errors.gender && (
                  <div className='invalid-feedback'>{errors.gender}</div>
                )}
              </div>

              <div className='mb-3'>
                <label htmlFor='role' className='form-label'>
                  Role <span className='text-danger'>*</span>
                </label>
                <select
                  className={`form-control ${errors.role ? "is-invalid" : ""}`}
                  id='role'
                  name='role'
                  value={formData.role}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value=''>Select role</option>
                  <option value='doctor'>Doctor</option>
                  <option value='admin'>Admin</option>
                  <option value='nurse'>Nurse</option>
                  <option value='triage_nurse'>Triage-nurse</option>
                  <option value='receptionnist'>Receptionnist</option>
                  <option value='ambulance_driver'>Ambulance_driver</option>
                </select>
                {errors.role && (
                  <div className='invalid-feedback'>{errors.role}</div>
                )}
              </div>

              <div className='mb-3'>
                <label htmlFor='registerEmail' className='form-label'>
                  Email <span className='text-danger'>*</span>
                </label>
                <input
                  type='email'
                  autoComplete='new-email'
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  id='registerEmail'
                  name='email'
                  placeholder='Enter your email'
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.email && (
                  <div className='invalid-feedback'>{errors.email}</div>
                )}
              </div>

              <div className='mb-3'>
                <label htmlFor='phone' className='form-label'>
                  Phone <span className='text-danger'>*</span>
                </label>
                <input
                  type='text'
                  className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                  id='phone'
                  name='phone'
                  placeholder='Enter phone with country code (e.g., +123456789)'
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.phone && (
                  <div className='invalid-feedback'>{errors.phone}</div>
                )}
              </div>

              <div className='mb-3 form-password-toggle'>
                <label className='form-label' htmlFor='registerPassword'>
                  Password <span className='text-danger'>*</span>
                </label>
                <div className='input-group input-group-merge'>
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete='new-password'
                    id='registerPassword'
                    className={`form-control ${
                      errors.password ? "is-invalid" : ""
                    }`}
                    name='password'
                    placeholder='Enter your password (min 8 characters)'
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <button
                    type='button'
                    className='btn btn-outline-secondary'
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <div className='invalid-feedback d-block'>
                    {errors.password}
                  </div>
                )}
              </div>

              <div className='mb-3'>
                <label htmlFor='image' className='form-label'>
                  Upload Image <span className='text-danger'>*</span>
                </label>
                <input
                  type='file'
                  ref={fileInputRef}
                  className={`form-control ${errors.image ? "is-invalid" : ""}`}
                  id='image'
                  name='image'
                  accept='image/*'
                  onChange={handleImageChange}
                  disabled={loading}
                />
                {errors.image && (
                  <div className='invalid-feedback'>{errors.image}</div>
                )}
              </div>

              {/* Affichage de l’image capturée ou uploadée */}
              {previewImage && (
                <div className="mb-3 text-center">
                  <p className="text-success">✅ Image sélectionnée</p>
                  <img
                    src={previewImage}
                    alt="Preview"
                    style={{
                      maxWidth: "200px",
                      borderRadius: "8px",
                      border: "2px solid #198754",
                    }}
                  />
                </div>
              )}

              {/* Capture avec caméra */}
              <div className="mb-3">
                <button type="button" className="btn btn-secondary" onClick={handleCapture}>
                  Capture Photo
                </button>
                {errors.camera && (
                  <div className='text-danger mt-2'>{errors.camera}</div>
                )}
              </div>

              <button
                className='btn btn-primary d-grid w-100'
                type='submit'
                disabled={loading || Object.keys(errors).length > 0}
              >
                {loading ? (
                  <>
                    <span
                      className='spinner-border spinner-border-sm me-2'
                      aria-hidden='true'
                    ></span>
                    Processing...
                  </>
                ) : (
                  "Sign up"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register