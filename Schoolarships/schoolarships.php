<link href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css" rel="stylesheet">
<?php
include 'functions.php';
// Connect to MySQL database
$pdo = pdo_connect_mysql();
// Get the page via GET request (URL param: page), if non exists default the page to 1
$page = isset($_GET['page']) && is_numeric($_GET['page']) ? (int)$_GET['page'] : 1;
// Number of records to show on each page
$records_per_page = 5;

// Prepare the SQL statement and get records from our contacts table, LIMIT will determine the page
$stmt = $pdo->prepare('SELECT * FROM students_table ORDER BY id');

$stmt->execute();
// Fetch the records so we can display them in our template.

$students = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Get the total number of contacts, this is so we can determine whether there should be a next and previous button
$num_students = $pdo->query('SELECT COUNT(*) FROM students_table')->fetchColumn();
?>




<main class="bg-gray-200 relative sm:w-full md:max-w-md lg:max-w-full mx-auto p-8 md:p-3 -my-8  shadow-2xl">
        <section class="">
            <h3 class="font-bold text-4xl relative ml-96 mt-16">Students schoolarships</h3>
            <a href="create.php"><button class="bg-black hover:bg-gray-900 text-white w-1/5 h-10 rounded-lg relative bottom-20 focus:outline-none">Create student</button></a><br>
            <hr>
            <a href="read.php"><button class="bg-black hover:bg-gray-900 text-white w-1/5 h-10 rounded-lg relative bottom-20 focus:outline-none">List all students</button></a><br>
            <hr>
            <a href="client/index.html"><button class="bg-black hover:bg-gray-900 text-white w-1/5 h-10 rounded-lg relative bottom-20 focus:outline-none">Go to chat</button></a>
        </section>
        <hr>
<div class="md:px-32 py-8 w-full">
  <div class="shadow overflow-hidden rounded-lg border-b border-gray-200">
    <table class="min-w-full bg-white">
      <thead class="bg-gray-800 text-white">
        <tr>
          <th class="text-left py-3 px-4 uppercase font-semibold text-sm">ID</th>
          <th class="text-left py-3 px-4 uppercase font-semibold text-sm">First name</th>
          <th class="text-left py-3 px-4 uppercase font-semibold text-sm">Last name</th>
          <th class="text-left py-3 px-4 uppercase font-semibold text-sm">Birthday</th>
          <th class="text-left py-3 px-4 uppercase font-semibold text-sm">Address</th>
          <th class="text-left py-3 px-4 uppercase font-semibold text-sm">Department</th>
          <th class="text-left py-3 px-4 uppercase font-semibold text-sm">Average grade</th>
          <th class="text-left py-3 px-4 uppercase font-semibold text-sm"></th>
          <th class="text-left py-3 px-4 uppercase font-semibold text-sm"></th>

        </tr>
        
      </thead>
    <tbody class="text-gray-700">
     
    <?php foreach ($students as $student): ?>
        <?php if ($student['average_grade']>"8.0"){?>
      <tr>
                <td class="w-1/3 text-left py-3 px-4"><?=$student['id']?></td>
                <td class="w-1/3 text-left py-3 px-4"><?=$student['first_name']?></td>
                <td class="w-1/3 text-left py-3 px-4"><?=$student['last_name']?></td>
                <td class="w-1/3 text-left py-3 px-4"><?=$student['birthday']?></td>
                <td class="w-1/3 text-left py-3 px-4"><?=$student['address']?></td>
                <td class="w-1/3 text-left py-3 px-4"><?=$student['department']?></td>
                <td class="w-1/3 text-left py-3 px-4"><?=$student['average_grade']?></td>
                <td class="hover:bg-gray-300"><a href="update.php?id=<?=$student['id']?>" class=""><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg></a></td>
                <td class="hover:bg-red-500"><a href="delete.php?id=<?=$student['id']?>" class=""><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg></a></td>
               
            </tr>
            <?php }?>
            <?php endforeach; ?>
    </tbody>
    </table>
  </div>
</div>
