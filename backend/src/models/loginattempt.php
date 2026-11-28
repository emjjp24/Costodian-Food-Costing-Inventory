<?php
// wrong passwords are remembered for a while, so guessing a password is slowed down
// if anything goes wrong here (for example the table is missing) the login still works and the problem goes to the error log

// the same name in small letters and at most 50 characters, so "Karen" and "karen" count together
function attemptKey($username){
    return mb_substr(mb_strtolower($username), 0, 50);
}

function clientIp(){
    return isset($_SERVER['REMOTE_ADDR']) ? substr((string)$_SERVER['REMOTE_ADDR'], 0, 45) : '';
}

// gives [how many wrong passwords in the lock time, when the last one was] for a column (username or ip)
function failureStats($conn, $column, $value){
    $since = date('Y-m-d H:i:s', time() - LOGIN_LOCK_MINUTES * 60);
    $sql = "SELECT COUNT(*) AS total, MAX(created_at) AS last_at FROM login_attempts WHERE $column = :value AND created_at >= :since";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':value', $value);
    $stmt->bindParam(':since', $since);
    $stmt->execute();
    $row = $stmt->fetch();
    return [(int)$row['total'], $row['last_at']];
}

// 0 when the person may try, otherwise the minutes left to wait
function loginLockMinutes($conn, $username){
    try{
        $minutes = 0;
        $checks = [['username', attemptKey($username), LOGIN_MAX_FAILS], ['ip', clientIp(), LOGIN_MAX_FAILS_PER_IP]];
        foreach($checks as $check){
            list($total, $last_at) = failureStats($conn, $check[0], $check[1]);
            if($total >= $check[2] && $last_at){
                $seconds = strtotime($last_at) + LOGIN_LOCK_MINUTES * 60 - time();
                if($seconds > 0){
                    $minutes = max($minutes, (int)ceil($seconds / 60));
                }
            }
        }
        return $minutes;
    } catch(Throwable $e){
        error_log('login lock check failed: ' . $e->getMessage());
        return 0;
    }
}

// remember a wrong password, gives how many tries are left for this username (null when unknown)
function recordLoginFailure($conn, $username){
    try{
        $key = attemptKey($username);
        $now = date('Y-m-d H:i:s');
        $ip = clientIp();
        $stmt = $conn->prepare("INSERT INTO login_attempts (username, ip, created_at) VALUES (:username, :ip, :now)");
        $stmt->bindParam(':username', $key);
        $stmt->bindParam(':ip', $ip);
        $stmt->bindParam(':now', $now);
        $stmt->execute();

        // old rows are not needed any more
        $old = date('Y-m-d H:i:s', time() - 86400);
        $stmt = $conn->prepare("DELETE FROM login_attempts WHERE created_at < :old");
        $stmt->bindParam(':old', $old);
        $stmt->execute();

        list($total) = failureStats($conn, 'username', $key);
        return max(0, LOGIN_MAX_FAILS - $total);
    } catch(Throwable $e){
        error_log('login failure was not saved: ' . $e->getMessage());
        return null;
    }
}

// a good login starts the count again
function clearLoginFailures($conn, $username){
    try{
        $key = attemptKey($username);
        $stmt = $conn->prepare("DELETE FROM login_attempts WHERE username = :username");
        $stmt->bindParam(':username', $key);
        $stmt->execute();
    } catch(Throwable $e){
        error_log('login failures were not cleared: ' . $e->getMessage());
    }
}
?>