<?php

require_once __DIR__.'/../app/AppKernel.php';

$kernel = new HelloKernel('prod', false);
$kernel->handle()->send();
