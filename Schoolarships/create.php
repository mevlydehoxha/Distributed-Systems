<link href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css" rel="stylesheet">
<?php
include 'functions.php';
$pdo = pdo_connect_mysql();
$msg = '';
// Check if POST data is not empty
if (!empty($_POST)) {
    // Post data not empty insert a new record
    // Set-up the variables that are going to be inserted, we must check if the POST variables exist if not we can default them to blank
    $id = isset($_POST['id']) && !empty($_POST['id']) && $_POST['id'] != 'auto' ? $_POST['id'] : NULL;
    $first_name = isset($_POST['first_name']) ? $_POST['first_name'] : '';
    $last_name = isset($_POST['last_name']) ? $_POST['last_name'] : '';
    $birthday = isset($_POST['birthday']) ? $_POST['birthday'] : '';
    $address = isset($_POST['address']) ? $_POST['address'] : '';
    $department = isset($_POST['department']) ? $_POST['department'] : '';
    $average_grade = isset($_POST['average_grade']) ? $_POST['average_grade'] : '';
    $stmt = $pdo->prepare('INSERT INTO students_table VALUES (?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([$id, $first_name, $last_name, $birthday,$address, $department, $average_grade]);
}
?>

    <main class="bg-gray-200 relative sm:w-full md:max-w-md lg:max-w-full mx-auto p-8 md:p-3 -my-8  shadow-2xl">
        <section class="">
            <h3 class="font-bold text-4xl relative ml-96 mt-16">Students registration</h3>
            <a href="read.php"><button class="bg-black hover:bg-gray-900 text-white w-1/5 h-10 rounded-lg relative bottom-20 focus:outline-none">List all students</button></a>
        </section>
        <hr>
        <section class="bg-gray-800 rounded-lg py-5 mx-auto">
            <form class="text-sm m-8 xs:p-4 sm:p-4 md:p-8 lg:p-8" method="post" action="create.php">
                <div class="relative rounded mb-4 appearance-none pl-64 ml-16">
                    <input class="w-2/3 h-10 py-2 px-3 text-black rounded" id="first_name" name="first_name" type="text" placeholder="First name">
                </div>
                <div class="relative rounded mb-4 appearance-none pl-64 ml-16">
                    <input class="w-2/3 h-10 py-2 px-3 text-black leading-normal rounded" id="last_name" name="last_name" type="text" placeholder="Last name">
                </div>
                <div class="relative rounded mb-4 appearance-none pl-64 ml-16">
                    <input class="w-2/3 h-10 py-2 px-3 text-black leading-normal rounded" id="birthday" name="birthday" type="date" placeholder="Birthday">
                </div>
                <div class="relative rounded mb-4 appearance-none pl-64 ml-16">
                    <input class="w-2/3 h-10 py-2 px-3 text-black leading-normal rounded" id="address" name="address" type="text" placeholder="Address">
                </div>
                <div class="relative rounded mb-4 appearance-none pl-64 ml-16">
                    <input class="w-2/3 h-10 py-2 px-3 text-black leading-normal rounded" id="department" name="department" type="text" placeholder="Department">
                </div>
                <div class="relative rounded mb-4 appearance-none pl-64 ml-16">
                    <input class="w-2/3 h-10 py-2 px-3 text-black leading-normal rounded" id="average_grade" name="average_grade" type="text" placeholder="Average grade">
                </div>
                <div class="relative rounded mb-4 appearance-none pl-64 -ml-12">
                    <div class="sm:w-full md:w-2/3 lg:w-11/12 xl:w-10/12 h-12 text-center align-baseline">
                        <input class="bg-black hover:bg-white hover:text-black text-white w-4/5 h-10 py-2 px-3 leading-normal rounded-lg" type="submit" value="Create"/>
                    </div>
                </div>
            </form>
            <?php if ($msg): ?>
            <p><?=$msg?></p>
            <?php endif; ?>
        </section>

    </main>

