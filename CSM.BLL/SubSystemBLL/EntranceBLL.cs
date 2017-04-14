﻿using CSM.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CSM.BLL.SubSystemBLL
{
    public class EntranceBLL:AbstractFilter
    {
        /// <summary>
        /// 处理门禁数据
        /// </summary>
        /// <param name="dataType"></param>
        /// <param name="message"></param>
        /// <param name="mark"></param>
        /// <returns></returns>
        public bool HandleEntranceData(int dataType, object message, string mark)
        {
            switch (dataType)
            {
                case (int)EnumClass.EntranceData.报警数据:
                    //
                    base.HandleAlarmData(message, mark, dataType, (int)EnumClass.SubSystem.门禁子系统);
                    break;
                default: break;
            }
            return true;
        }
    }
}
