<?php

namespace App\Models\Core;

enum AccessType: string
{
    case PUBLIC = 'public';
    case PRIVATE = 'private';
}
