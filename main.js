function initProcess() {
    $(".progress").css({
        "height": "2rem",
        "font-size": "1.5rem",
        "border-radius": "0.25rem"
    });
    $("#progressbar1").attr("aria-valuenow", 0).css("width", 0 + "%").text("");
    $("#progressbar2").attr("aria-valuenow", 0).css("width", 0 + "%").text("").css({
        "background-color": "#005f99"
    });
    $("#result-wait-1").css('display', 'block');
    $("#result-wait-2").css('display', 'none');
    $("#result-wait-4").css('display', 'none');
    $("#result-wait-3").css('display', 'none');
}

function show_model(kdata, title, ext, note) {
    downloadTitle = title;
    downloadUrl[ext][note] = kdata.downloadUrlX;
    $("#loading_img").css('display', 'none');
    $("#result-wait").css('display', 'none');

    $("#myModalLabel").text(title);
    $('#myModal').modal('show');
    $("#A_downloadUrl").attr("href", kdata.downloadUrlX);
    return;

    var a = Math.random();
    var adurl;
    if (a < 1) {
        adurl = "https://chatgpt.www-2048.com?ext=" + encodeURIComponent(ext) + "&title=" + encodeURIComponent(title) + "&url=" + encodeURIComponent(kdata.downloadUrlX) + "&dd=1";
    } else {
        adurl = "https://chatgpt.www-2048.com?ext=" + encodeURIComponent(ext) + "&title=" + encodeURIComponent(title) + "&url=" + encodeURIComponent(kdata.downloadUrlX) + "&dd=1";
    }
    if (isWindowOpenUrl(adurl)) {
        return;
    } else {
        if (Math.random() < 1) {
            $("#myModalLabel").text(title);
            $('#myModal').modal('show');
            $("#A_downloadUrl").attr("target", "_blank");
            $("#A_downloadUrl").click(function() {
                $('#myModal').modal('hide');
            })
            $("#A_downloadUrl").attr("href", adurl);
        } else {
            $("#myModalLabel").text(title);
            $('#myModal').modal('show');
            $("#A_downloadUrl").attr("href", kdata.downloadUrlX);
        }
    }
}

function downloadStatus(url, title, id, ext, totalSize, note, format, countP, status_stop) {
    if (countP != count || status_stop) {
        return;
    }
    if (!downloadUrl[ext][note]) {
        $.ajax({
            type: "POST",
            url: getStatusHost(id),
            headers: {
                "x-note": note
            },
            data: {
                platform: "youtube",
                url: url,
                title: title,
                id: id,
                ext: ext,
                note: note,
                format: format,
            },
            dataType: "json",
            success: function(kdata) {
                if (countP == count) {
                    if (downloadUrl[ext][note]) {
                        d_busy = false; // by timer
                        return;
                    }
                    if (kdata.status == 'success') {
                        show_model(kdata, title, ext, note);
                        d_busy = false;
                    } else if (kdata.status == 'convert_ready') {
                        setTimeout(function() {
                            download(url, title, id, ext, totalSize, note, format, countP);
                        }, 20000)
                    } else if (kdata.status == 'processing') {
                        setTimeout(function() {
                            downloadStatus(url, title, id, ext, totalSize, note, format, countP, status_stop);
                        }, 4000)
                        if (kdata["type"] != undefined && kdata["type"] == "downloading") {
                            if (kdata.percent != undefined) {
                                var p = parseInt(kdata.percent.substr(0, kdata.percent.length - 1));
                                var nowP = $("#progressbar1").attr("aria-valuenow");
                                if (p > nowP) {
                                    $("#progressbar1").attr("aria-valuenow", p);
                                    $("#progressbar1").css("width", p + "%");
                                    $("#progressbar1").text(p + "%");
                                }
                            }
                        }
                        if (kdata["type"] != undefined && kdata["type"] == "converting") {
                            $("#result-wait-1").css('display', 'none');
                            if (note == "mp3-128k" || note == "mp3-320k") {
                                $("#result-wait-4").css('display', 'block');
                            } else {
                                $("#result-wait-2").css('display', 'block');
                            }
                            $("#result-wait-3").css('display', 'none');
                            if (kdata.percent != undefined) {
                                var p = parseInt(kdata.percent.substr(0, kdata.percent.length - 1));
                                var nowP = $("#progressbar2").attr("aria-valuenow");
                                $("#progressbar1").attr("aria-valuenow", 100);
                                $("#progressbar1").css("width", 100 - p + "%");
                                $("#progressbar1").text("");
                                if (p > nowP) {
                                    $("#progressbar2").attr("aria-valuenow", p);
                                    $("#progressbar2").css("width", p + "%");
                                    $("#progressbar2").text(p + "%");
                                }
                            }
                        }
                        if (kdata["type"] != undefined && kdata["type"] == "merging") {
                            $("#progressbar1").attr("aria-valuenow", 100);
                            $("#progressbar1").css("width", 0 + "%");
                            $("#progressbar1").text("");
                            $("#progressbar2").attr("aria-valuenow", 100);
                            $("#progressbar2").css("width", 100 + "%");
                            $("#progressbar2").text(100 + "%");
                            $("#result-wait-1").css('display', 'none');
                            $("#result-wait-2").css('display', 'none');
                            $("#result-wait-4").css('display', 'none');
                            $("#result-wait-3").css('display', 'block');
                        }
                    } else {
                        $("#loading_img").css('display', 'none');
                        $("#result-wait").css('display', 'none');
                        alert("Some errors occurred during conversion, try again or use another link")
                    }
                }

            },
            error() {
                if (countP == count) {
                    $("#loading_img").css('display', 'none');
                    $("#result-wait").css('display', 'none');
                    alert("Some errors occurred during conversion, try again or use another link")
                    d_busy = false;
                }
            }
        });
    }
}


function download(url, title, id, ext, totalSize, note, format, countP) {
    console.log("count", countP);

    if (countP !== undefined && countP !== count) {
        return;
    }
    if (!downloadUrl[ext][note] && !d_busy) {
        if (countP == undefined) {
            countP = count;
        }
        d_busy = true;
        var status_stop = false;
        $.ajax({
            type: "POST",
            headers: {
                "x-note": note
            },
            url: getDownloadHost(id),
            data: {
                platform: "youtube",
                url: url,
                title: title,
                id: id,
                ext: ext,
                note: note,
                format: format
            },
            dataType: "json",
            beforeSend: function() {
                initProcess()
                $("#loading_img").css('display', 'inline');
                $("#result-wait").css('display', 'inline');
                setTimeout(function() {
                    downloadStatus(url, title, id, ext, totalSize, note, format, countP, status_stop);
                }, 4000)
            },
            success: function(kdata) {
                if (countP == count) {
                    d_busy = false;
                    if (downloadUrl[ext][note]) { // by timer
                        return;
                    }
                    if (kdata.status == 'success') {
                        show_model(kdata, title, ext, note)
                    } else if (kdata.status == 'convert_ready') {
                        setTimeout(function() {
                            download(url, title, id, ext, totalSize, note, format, countP);
                        }, 20000)
                    } else if (kdata.status == 'busy') {
                        $("#loading_img").css('display', 'none');
                        $("#result-wait").css('display', 'none');
                        status_stop = true;
                        alert("Service is busy, Please try again later")
                    } else {
                        $("#loading_img").css('display', 'none');
                        $("#result-wait").css('display', 'none');
                        status_stop = true;
                        alert("Some errors occurred during conversion, try again or use another link")
                    }
                }

            },
            error() {
                if (countP == count) {
                    d_busy = false;
                    $("#loading_img").css('display', 'none');
                    $("#result-wait").css('display', 'none');
                    alert("Some errors occurred during conversion, try again or use another link")
                }
            }
        });
    } else {
        if (downloadUrl[ext][note]) {
            $("#myModalLabel").text(downloadTitle);
            $('#myModal').modal('show');
            $("#A_downloadUrl").attr("href", downloadUrl[ext][note]);
        }
    }

}

function isWindowOpenUrl(url) {
    let isBlocked = false
    try {
        let popup = window.open(url, "_blank");
        if (popup == null || typeof(popup) == "undefined") {
            isBlocked = true
        }
    } catch (e) {
        isBlocked = true
    }
    return !isBlocked;
}

function analyze(retry) {
    if (!a_busy) {
        a_busy = true;
        downloadTitle = null;
        downloadUrl = {
            "mp3": {},
            "mp4": {}
        };
        count += 1;
        d_busy = false;
        $("#loading_img").css('display', 'none');
        $("#result-wait").css('display', 'none');
        $("#error_youtube_url").hide();

        var k_query = $('#txt-url').val().trim();
        if (k_query.trim() === "") {
            a_busy = false;
            return;
        }

        var platform = "youtube";
        if (k_query.indexOf("fb.watch") >= 0 || k_query.indexOf("facebook.com") >= 0) {
            //platform = "facebook";
            // let url = "https://tribunepointweekly.com/?download="+k_query+"&lang="+lang;
            // if (isWindowOpenUrl(url)) {
            //     a_busy = false;
            //     return;
            // }
        } else if (k_query.indexOf("tiktok.com") >= 0) {
            //platform = "tiktok";
            // let url = "https://tribunepointweekly.com/?download="+k_query+"&lang="+lang;
            // if (isWindowOpenUrl(url)) {
            //     a_busy = false;
            //     return;
            // }
        } else if (k_query.indexOf("instagram.com") >= 0) {
            //platform = "instagram";
        } else if (k_query.indexOf("x.com") >= 0 || k_query.indexOf("twitter.com") >= 0) {
            //platform = "twitter";
            // let url = "https://tribunepointweekly.com/?download="+k_query+"&lang="+lang;
            // if (isWindowOpenUrl(url)) {
            //     a_busy = false;
            //     return;
            // }
        }

        $.ajax({
            type: "POST",
            url: getAnalyseHost(k_query, platform, retry),
            dataType: 'json',
            data: {
                url: k_query,
                ajax: 1,
                lang: lang
            },
            beforeSend: function() {
                $(".dropdown-menu").css('display', 'none');
                $("#loading_img").css('display', 'inline');
                $("#result").empty();
                $("#btn-submit").focus();
            },
            success: function(rpdata) {
                $(".dropdown-menu").css('display', 'none');
                $("#loading_img").css('display', 'none');
                if (rpdata.status == 'success') {
                    $("#result").empty().append(rpdata.result);
                    // if (window.screen.width <= 800) {
                    $("#search-result a").attr("target", "_self");
                    $("#myTabContent a").attr("target", "_blank");
                    // }
                    var href_prefix = lang == 'en' ? "/" : ("/" + lang + "/");
                    $.each($("#search-result a"), function(idx, val) {
                        if ($(val).attr('href').indexOf("watch?v=") >= 0) {
                            $(val).attr('href', href_prefix + $(val).attr('href'))
                        }
                    });
                    if (window.innerWidth <= 800) {
                        document.querySelector('#convert').scrollIntoView(true);
                    }
                    if (location.pathname.indexOf("youtube-to-mp3") > -1) {
                        $('#selectTab a[href="#mp3"]').tab('show');
                    }

                } else if (rpdata.status == 'unavailable') {
                    $("#result").empty().append(rpdata.result);
                } else if (rpdata.status == 'playError') {
                    if (retry == undefined) {
                        retry = 1;
                        a_busy = false;
                        analyze(retry);
                    } else {
                        $("#result").empty().append(rpdata.result);
                    }
                } else {
                    if (rpdata.status !== undefined && rpdata.result !== undefined) {
                        $("#result").empty().append(rpdata.result);
                    }
                }
                a_busy = false;
            },
            error() {
                $(".dropdown-menu").css('display', 'none');
                $("#loading_img").css('display', 'none');
                $("#result").empty().append("<div class=\"tabs row\">\n" +
                    "                \n" +
                    "                    <div class=\"col-xs-12 col-12 col-sm-12 col-md-12\">\n" +
                    "                        <div class=\"caption text-left\"> <b></b> \n" +
                    "                            <div role=\"alert\" class=\"alert alert-danger text-center\"> \n" +
                    "                                <span class=\"glyphicon glyphicon-exclamation-sign\" aria-hidden=\"true\"></span> \n" +
                    "                                <span class=\"sr-only\">Error : </span> Service is wrong, Please try again later<br>  \n" +
                    "                            </div> \n" +
                    "                        </div>\n" +
                    "                    </div>\n" +
                    "                    <div class=\"clearfix\"></div>\n" +
                    "                </div>");
                $("#result").empty().append(`
                <style>
                    #cardApiDiv {
                        position: relative;
                        padding-bottom: 20px;
                        z-index: 1000 !important;
                        background-color: white;
                        height: 270px;
                        display: block;
                    }
                
                    @media screen and (max-width: 480px) {
                        #cardApiDiv {
                            height: 500px;
                        }
                    }
                </style>
                
                <div id="cardApiDiv">
                
                    <iframe id="cardApiIframe" scrolling="no" height="100%" allowtransparency="true"
                        style="border: none;align-items: center;"
                        src="https://loader.to/api/card2/?url=${k_query}&css=https://an07.genyoutube.online/card.css"
                        width="100%"></iframe>
                    <!-- Put the Library in your <head> tag -->
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.3.9/iframeResizer.min.js"></script>
                    <!-- Put the resizer code after the <iframe> tag -->
                    <script> iFrameResize({ log: false }, '#cardApiIframe') </script>
                </div>
                `);
                a_busy = false;
            }
        });
    }

};

function analyze2(id) {
    $("#txt-url").val("https://www.youtube.com/watch?v=" + id);
    analyze();
}

$(document).ready(function() {
    $("#txt-url")[0].onpaste = function() {
        if ($("#txt-url").val() == "") {
            setTimeout(analyze, 100);
        }
    };
    $('.language').click(function(e) {
        $(".sub-language").toggleClass("show-language");
    });
    $(window).click(function(event) {
        var $target = $(event.target);
        var $parent = $target.closest(".sub-language");
        var $show = $target.closest(".language");
        if ($parent.length == 0 && $show.length == 0) {
            var $search = $('.sub-language');
            $search.removeClass("show-language");
        }
    });

    $('#txt-url').keypress(function(e) {
        if (e.which == 13) {
            e.preventDefault();
            analyze();
        }
    });

    $('#btn-submit').click(function() {
        analyze();
    });
    $.ajaxSetup({
        cache: true
    });

    $(".dropdown").setMenu();
});

function openNav() {
    $(".topnav").toggleClass("responsive")
}

jQuery.fn.extend({
    setMenu: function() {
        return this.each(function() {
            var n = $(this),
                t = n.find(".dropdown-title");
            t.click(function() {
                var t = n.find(".dropdown-content");
                t.slideToggle(500)
            });
            $(document).click(function(t) {
                if (!n.is(t.target) && n.has(t.target).length === 0) {
                    var i = n.find(".dropdown-content").css("display");
                    i == "block" && n.find(".dropdown-content").slideToggle(500)
                }
            })
        })
    }
});

var hiddden_val = document.getElementById("hidden_val")
var lang = hiddden_val.getAttribute("lang")
var theme = hiddden_val.getAttribute("theme")
var a_busy = false;
var downloadUrl = {
    "mp3": null,
    "mp4": null
};
var downloadTitle = null;
var d_busy = false;
var count = 1;

$.getScript("/theme/bootstrap4/js/bootstrap-suggest.min.js?v=3.199",
    function() {
        $("#txt-url").bsSuggest({
            indexId: 0,
            indexKey: 0,
            allowNoKeyword: false,
            multiWord: true,
            separator: ",",
            getDataMethod: "url",
            showHeader: false,
            autoDropup: false,
            searchingTip: 'Searching...',
            delay: 50,
            url: 'https://suggestqueries.google.com/complete/search?hl=en&ds=yt&client=youtube&q=',
            jsonp: 'jsonp',
            fnProcessData: function(json) {
                var index, len, data = {
                    value: []
                };

                if (!json || !json.length) {
                    return false;
                }
                len = json[1].length;

                for (index = 0; index < len; index++) {
                    data.value.push({
                        "Keyword": json[1][index][0]
                    });
                }
                return data;
            },

        }).on('onDataRequestSuccess', function(e, result) {
            // console.log('onDataRequestSuccess: ', result);
        }).on('onSetSelectValue', function(e, keyword, data) {
            // console.log('onSetSelectValue: ', e, keyword, data);
            if (keyword['mousedown']) {
                analyze()
            }
        }).on('onUnsetSelectValue', function() {
            // console.log("onUnsetSelectValue");
        });
    });

function getDownloadHost(id) {
    return "/mates/en/convert?id=" + id;
}

function getStatusHost(id) {
    return "/mates/en/convert/status?id=" + id;
}

// function getAnalyseHost(id,platform,retry) {
//     return "/mates/en/analyze/ajax?retry="+retry+"&platform="+platform;
// }

function getAnalyseHost(id, platform, retry) {
    var k_query = $('#txt-url').val().trim();
    var mhash = murmurHash64(k_query)
    return "/mates/en/analyze/ajax?retry=" + retry + "&platform=" + platform + "&mhash=" + mhash;
}

function murmurHash64(str) {
    let h1 = 0xdeadbeef;
    let h2 = 0x41c6ce57;

    for (let i = 0; i < str.length; i++) {
        let k = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ k, 0x85ebca6b);
        h2 = Math.imul(h2 ^ k, 0xc2b2ae35);
    }

    h1 = Math.imul(h1 ^ (h1 >>> 16), 0x85ebca6b) ^ Math.imul(h2 ^ (h2 >>> 13), 0xc2b2ae35);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 0x85ebca6b) ^ Math.imul(h1 ^ (h1 >>> 13), 0xc2b2ae35);

    return (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
}