<?php

namespace Libraries;

class Validator
{
    public function validate($input, string $pattern = 'alphanum', int|float $min = 0, int|float $max = 255): mixed
    {
        $options = [
            'options' => [
                'min_range' => $min,
                'max_range' => $max,
            ],
        ];

        $patterns = [
            'alpha' => '/^([a-z])+$/i',
            'alphanum' => '/^([a-z0-9])+$/i',
            'slug' => '/^([a-z0-9-_])+$/i',
            'text' => '/^([a-z0-9-_.,?!: ])+$/i',
        ];

        switch ($pattern) {
            case 'bool':
                if (!is_bool(value: $input)) {
                    throw new \Exception(message: "Invalid boolean.");
                }
                break;
            case 'email':
                if (!filter_var(value: $input, filter: FILTER_VALIDATE_EMAIL)) {
                    throw new \Exception(message: "Invalid email address.");
                }
                break;
            case 'int':
                if (!filter_var(value: $input, filter: FILTER_VALIDATE_INT, options: $options)) {
                    throw new \Exception(message: "Invalid integer.");
                }
                break;
            case 'float':
                if (!filter_var(value: $input, filter: FILTER_VALIDATE_FLOAT, options: $options)) {
                    throw new \Exception(message: "Invalid float.");
                }
                break;
            case 'date':
                if (!strtotime(datetime: $input)) {
                    throw new \Exception(message: "Invalid date.");
                }
                break;
            default:
                if (strlen(string: $input) < $min || strlen(string: $input) > $max) {
                    throw new \Exception(message: "Invalid string length.");
                }

                if (!array_key_exists(key: $pattern, array: $patterns)) {
                    throw new \Exception(message: "Invalid pattern.");
                }

                if (!preg_match(pattern: $patterns[$pattern], subject: $input)) {
                    throw new \Exception(message: "Invalid $pattern.");
                }

                break;
        }

        return $input;
    }

    public function batchValidate(array $values, array $rules): array
    {
        foreach (array_keys($rules) as $key) {
            $rule = explode(separator: '|', string: $rules[$key]);
            if (isset($rule[1])) {
                $limiter = explode(separator: ' ', string: $rule[1]);
                self::validate(
                    input: $values[$key],
                    pattern: $rule[0],
                    min: str_replace(search: 'min:', replace: '', subject: $limiter[0]),
                    max: str_replace(search: 'max:', replace: '', subject: $limiter[1]),
                );
            } else {
                self::validate(input: $values[$key], pattern: $rule[0]);
            }
        }

        return $values;
    }
}
