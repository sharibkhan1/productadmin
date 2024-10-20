"use client"
import {X} from "lucide-react"
import React from 'react'
import "@uploadthing/react/styles.css"
import Image from "next/image";
import { UploadDropzone } from "@/utils/uploadthing";

interface FileUploadProps{
    onChange:(url?: string)=> void;
    value: string;
    endpoint:"serverImage";
}

const FileUpload = ({onChange,value,endpoint}:FileUploadProps) => {
    const fileType = value?.split(".").pop();

    if(value && fileType !=="pdf"){
        return(
            <div className="relative h-[20rem] w-[20rem]" > 
                <Image
                    fill
                    src={value}
                    alt="upload"
                    className="rounded-full border-4 border-black"
                />
                <button className="bg-rose-500 text-white p-1 
                rounded-full absolute top-0 right-16 shadow-sm "
                onClick={()=>onChange("")} 
                 type="button"   >
                    <X className="h-5 w-5" />
                </button>
            </div>
        )
    }
  return (
    <UploadDropzone
          onClientUploadComplete={(res) => {
              onChange(res?.[0].url);
          } }
          onUploadError={(error: Error) => {
              console.log(error);
          } } endpoint={"imageUploader"}    />
  )
}

export default FileUpload