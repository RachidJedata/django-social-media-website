import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function login(username: String, password: String) {

  const fetchData = fetch('http://localhost:8000/auth/jwt/create/',
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        username, password
      }),
    }
  )
  const response = await fetchData;

  const data = await response.json();

  if (response.status == 200) {
    localStorage.setItem('jwtToken', data.access)
    localStorage.setItem('jwtTokenRefresh', data.refresh)

    return true

  }
  throw new Error(data.details || "An error occured, Please Try Again Later !")

}