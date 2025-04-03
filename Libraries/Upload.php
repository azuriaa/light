<?php

namespace Libraries;

class Upload
{
  public function save($form, $path = ROOTPATH . 'Storage/Upload/'): string
  {
    if (!isset($_FILES[$form]['tmp_name'])) {
      throw new \Exception('No file!');
    }

    $filename = basename($_FILES[$form]['name']);
    $duplicate = 0;
    while (file_exists($path . $filename)) {
      $filename = basename($duplicate . '_' . $_FILES[$form]['name']);
      $duplicate++;
    }

    if (!move_uploaded_file($_FILES[$form]['tmp_name'], $path . $filename)) {
      throw new \Exception('Invalid file!');
    }

    return $filename;
  }
}
