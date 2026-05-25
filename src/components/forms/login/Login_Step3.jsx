'use client'

import React from 'react'
import BaseInfo from "@/components/marketing/BaseInfo";
import ContactInfo from "@/components/marketing/ContactInfo";
import PhotoGallery from "@/components/marketing/PhotoGallery";
import Specifications from "@/components/marketing/Specifications";
import { useRouter } from 'next/navigation';

export default function Login_Step3() {

    const router = useRouter()
    return (
        <div className='p-6'>
            <div className='mb-6 mt-2 text-xl  text-center w-full  font-extrabold '>
                <h1 className='bg-slate-600 w-fit py-4 px-10 rounded-xl text-gray-100'>ثبت نام کسب و کار</h1>
            </div>
            <div>
                <BaseInfo />
                <PhotoGallery />
                <Specifications />
                <ContactInfo />
            </div>
            <div className='flex items-center justify-end' onClick={() => router.push('/dashboard')}>
                <button className='bg-indigo-600 shadow-xl text-gray-100 py-3 px-12 rounded-lg font-semibold hover:bg-indigo-700 transition-colors mb-20 mt-6'>ثبت نهایی</button>
            </div>
        </div>
    )
}
