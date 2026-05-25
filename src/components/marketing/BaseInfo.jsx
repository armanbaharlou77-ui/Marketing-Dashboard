import React from 'react'

export default function BaseInfo() {
    return (
        <div className='w-full h-fit border rounded-xl border-gray-300 bg-slate-100 shadow-lg md:p-6 p-4'>
            <h1 className='md:text-2xl text-lg font-bold  border-b-2 border-blue-400 w-fit'>اطلاعات پایه</h1>
            <p className='md:text-xl text-md text-gray-500 my-4  mb-10'>اطلاعات پایه کسب و کار خود را وارد کنید</p>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                <div className='space-y-1'>
                    <label className='text-md font-medium text-gray-700'>عنوان</label>
                    <input autoFocus className='w-full h-12 mt-2 border-gray-300 bg-white/70 shadow-sm border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500' type="text" placeholder=' فروشگاه عطر یاس' />
                </div>
                <div className='space-y-1'>
                    <label className='text-md font-medium text-gray-700'>توضیح کوتاه</label>
                    <input className='w-full h-12 mt-2 border-gray-300 bg-white/70 shadow-sm border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500' type="text" placeholder=' عرضه انواع عطر و ادکلن اورجینال' />
                </div>
                <div className='space-y-1 md:col-span-2'>
                    <label className='text-md font-medium text-gray-700'>درباره کسب و کار</label>
                    <textarea className='w-full resize-none mt-2 h-34 border-gray-300 bg-white/70 shadow-sm border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder=' فروشگاه ما با بیش از 10 سال سابقه در زمینه عطر و ادکلن فعالیت می کند.' />
                </div>
            </div>

        </div>
    )
}
