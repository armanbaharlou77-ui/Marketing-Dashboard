'use client'

import React from 'react'
import { useState } from 'react';

export default function WorkingTime() {

    const daysOfWeek = [
        "شنبه",
        "یکشنبه",
        "دوشنبه",
        "سه شنبه",
        "چهارشنبه",
        "پنجشنبه",
        "جمعه",
    ];

    const [workingHours, setWorkingHours] = useState(
        daysOfWeek.map((day) => ({
            day,
            from: "",
            to: "",
        }))
    );




    const handleWorkingHoursChange = (day, field, value) => {
        setWorkingHours((prev) =>
            prev.map((item) => (item.day === day ? { ...item, [field]: value } : item))
        );
    };


    return (
        <div className="w-full h-fit border rounded-xl border-gray-300 bg-slate-100 shadow-lg md:p-6 p-4 mt-8">

            <h1 className="md:text-2xl text-lg font-bold border-b-2 border-blue-400 w-fit">ساعات کاری</h1>
            <p className='md:text-xl text-md text-gray-500 my-4  mb-10'>ساعات کاری را طبق روز های هفته وارد کنید</p>

            <div className="space-y-3">
                {workingHours.map((item) => (
                    <div
                        key={item.day}
                        className="border border-gray-300 rounded-2xl bg-white/70 p-4 shadow-sm grid grid-cols-1 md:grid-cols-[100px_8fr_1fr] gap-3 items-center"
                    >
                        <span className="text-md font-medium text-gray-700">
                            {item.day}
                        </span>

                        <div className="flex gap-4 items-center justify-center">

                            <div className="space-y-1">
                                <label className="text-md font-medium text-gray-700">ساعت شروع</label>
                                <input
                                    className="w-full h-12 mt-2 border-gray-300 shadow-sm border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    type="time"
                                    value={item.from}
                                    onChange={(event) =>
                                        handleWorkingHoursChange(item.day, "from", event.target.value)
                                    }
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-md font-medium text-gray-700">ساعت پایان</label>
                                <input
                                    className="w-full h-12 mt-2 border-gray-300 shadow-sm border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    type="time"
                                    value={item.to}
                                    onChange={(event) =>
                                        handleWorkingHoursChange(item.day, "to", event.target.value)
                                    }
                                />
                            </div>
                        </div>
                    </div>

                ))
                }
            </div >

        </div >
    )
}
