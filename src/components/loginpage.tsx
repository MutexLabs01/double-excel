import React from "react";

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl flex w-full max-w-4xl overflow-hidden">
        {/* Left Side - Illustration */}
        <div className="hidden md:flex flex-1 bg-indigo-50 items-center justify-center p-8">
          <div className="w-full h-full flex items-center justify-center">
            {/* Placeholder for illustration */}
            <div className="w-64 h-64 bg-indigo-200 rounded-xl flex items-center justify-center text-indigo-700 font-semibold">
              <img src="../../public/loginpageimage2.jpg"  alt="" />
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Login to Account</h2>

          <form className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-gray-300" />
                Remember me
              </label>
              <a href="#" className="text-indigo-600 hover:underline">
                Forgot password?
              </a>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Login
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="px-4 text-sm text-gray-500">Or Login With</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* Social logins */}
          <div className="flex justify-center gap-4">
            <button className="p-2 border rounded-full hover:bg-gray-100">
              <img src="https://cdn-icons-png.flaticon.com/512/300/300221.png" alt="Google" className="w-6 h-6" />
            </button>
            <button className="p-2 border rounded-full hover:bg-gray-100">
              <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Facebook" className="w-6 h-6" />
            </button>
            <button className="p-2 border rounded-full hover:bg-gray-100">
              <img src="https://cdn-icons-png.flaticon.com/512/1384/1384065.png" alt="Twitter" className="w-6 h-6" />
            </button>
            <button className="p-2 border rounded-full hover:bg-gray-100">
              <img src="https://cdn-icons-png.flaticon.com/512/1384/1384014.png" alt="LinkedIn" className="w-6 h-6" />
            </button>
          </div>

          {/* Sign up redirect */}
          <p className="mt-6 text-sm text-center text-gray-600">
            Don’t have an account?{" "}
            <a href="#" className="text-indigo-600 hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
