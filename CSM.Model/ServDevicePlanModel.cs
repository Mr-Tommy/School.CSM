﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CSM.Model
{
	 	//Serv_Device_Plan
	 public class ServDevicePlanModel
	{
   		     
      	/// <summary>
		/// id
        /// </summary>		
        public int id{set;get;}      
		/// <summary>
		/// 可以编辑
        ///  有默认规则
        /// </summary>		
        public int plan_code{set;get;}      
		/// <summary>
		/// plan_name
        /// </summary>		
        public string plan_name{set;get;}      
		/// <summary>
		/// plan_level
        /// </summary>		
        public int plan_level{set;get;}      
		/// <summary>
		/// device_id
        /// </summary>		
        public int device_id{set;get;}      
		/// <summary>
		/// create_time
        /// </summary>		
        public DateTime create_time{set;get;}      
		/// <summary>
		/// update_time
        /// </summary>		
        public DateTime update_time{set;get;}      
		/// <summary>
		/// 创建，待审核：1
       ///审核，启用：2
        ///审核，未启用：3
        /// </summary>		
        public int plan_status{set;get;}      
		/// <summary>
		/// ssoid
        /// </summary>		
        public int person_id{set;get;}      
		/// <summary>
		/// 预案执行时间段
       /// 8:00-17:00 
       /// 17:00-24:00
       /// 0:00-8:00
        /// </summary>		
        /// <summary>
        /// ext1
        /// </summary>		
        public string ext1{set;get;}      
		/// <summary>
		/// ext2
        /// </summary>		
        public string ext2{set;get;}      
		/// <summary>
		/// ext3
        /// </summary>		
        public string ext3{set;get;}      
		/// <summary>
		/// ext4
        /// </summary>		
        public string ext4{set;get;}      
		/// <summary>
		/// ext5
        /// </summary>		
        public string ext5{set;get;} 
        
     


    }
}

