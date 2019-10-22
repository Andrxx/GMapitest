using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GMapitest.Models
{
    public class Location
    {
        public double lat { get; set; }
        public double lng { get; set; }
        public string description { get; set; }
        public int radius { get; set; }
        public string img { get; set; }

    }
}