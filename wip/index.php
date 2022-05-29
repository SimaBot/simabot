<?php
  $options = array(
    'http'=>array(
      'method'=>"GET",
      'header'=>"Accept-language: ru-RU\r\n" .
                "Access-Control-Allow-Origin: *" .
                "Cookie: foo=bar\r\n" .  // check function.stream-context-create on php.net
                "User-Agent: Mozilla/5.0 (iPad; U; CPU OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B334b Safari/531.21.102011-10-16 20:23:10\r\n" // i.e. An iPad
    )
  );

  $context = stream_context_create($options);
  $url = "http://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
  $urlforreq = parse_url($url, PHP_URL_QUERY);
  $xml = file_get_contents($urlforreq, False, $context);
  echo $xml; # output "myqueryhash"
?>
