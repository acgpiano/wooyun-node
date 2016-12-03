$(function() {
    var select = {
        default: '全部',
        title: '标题',
        author: '作者',
        type: '类型',
        crop: '厂商',
    };

    var $select = $('#typechoose'),
        content = $('#content'),
        option;

    for (var item in select) {
        option = $('<option>').val(item).text(select[item]);
        $select.append(option);
    }

    $('#submit').on('click', function(e) {
        e.preventDefault();
        var selected = $select.find("option:selected").val();

        location.href = '/result?type=' + selected + '&content=' + content.val();
    });
});