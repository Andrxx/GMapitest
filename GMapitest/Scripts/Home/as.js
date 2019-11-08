var as = as || {};

as.options = {
    jspath: '/js',
    jsErrorHandler: '/ArkStuff/jsError'
};
as.init = function (options) {
    as.options = $.extend(as.options, options);
    as.sys.init();
    as.loadLibs();
    if (as.ark) setTimeout(as.ark.init, 600);
};
as.loadLibs = function () {
    as.sys.loadLib(as.options.jspath + "/fancy/source/jquery.fancybox.pack.js", as.options.jspath + "/fancy/source/jquery.fancybox.css", $.fancybox);
    as.sys.loadLib(as.options.jspath + "/as/gritter/js/jquery.gritter.min.js", as.options.jspath + "/as/gritter/css/jquery.gritter.css", $.gritter);
    as.sys.loadLib(as.options.jspath + "/jquery.bootstrap-growl.min.js", "", $.bootstrapGrowl);
    as.sys.loadLib("/js/bootstrap-editable/js/bootstrap-editable.js", "/js/bootstrap-editable/css/bootstrap-editable.css", $('.crdEditable').editable);
    as.sys.loadLib("/js/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js", "/js/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css", $.fn.datetimepicker);

    as.sys.loadLib(as.options.jspath + "/bootstrap-daterangepicker/moment.min.js", "", document.moment);
    as.sys.loadLib(as.options.jspath + "/bootstrap-daterangepicker/daterangepicker.js", as.options.jspath + "/bootstrap-daterangepicker/daterangepicker-bs3.css", $.daterangepicker);
};

$(function () {
    as.init({});
});

   